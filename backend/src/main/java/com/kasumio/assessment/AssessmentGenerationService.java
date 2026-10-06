package com.kasumio.assessment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kasumio.opportunity.Opportunity;
import com.kasumio.opportunity.OpportunitySkill;
import com.kasumio.skill.Skill;
import com.kasumio.skill.SkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Assessment Generation Service
 * 
 * Generates contextual technical screening blueprints and instantiated question banks
 * (Coding, Debugging, MCQ, SQL, API Reasoning) tailored directly to opportunity requirements.
 */
@Service
public class AssessmentGenerationService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentGenerationService.class);

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final CodingProblemRepository codingProblemRepository;
    private final TestCaseRepository testCaseRepository;
    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;

    public AssessmentGenerationService(AssessmentRepository assessmentRepository,
                                       AssessmentQuestionRepository questionRepository,
                                       QuestionOptionRepository optionRepository,
                                       CodingProblemRepository codingProblemRepository,
                                       TestCaseRepository testCaseRepository,
                                       SkillRepository skillRepository,
                                       ObjectMapper objectMapper) {
        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.codingProblemRepository = codingProblemRepository;
        this.testCaseRepository = testCaseRepository;
        this.skillRepository = skillRepository;
        this.objectMapper = objectMapper;
    }

    public static class BlueprintTemplate {
        public String title;
        public String description;
        public int timeLimitMinutes = 45;
        public int passingScore = 70;
        public List<String> focusAreas = new ArrayList<>();
        public List<GeneratedQuestionSpec> questions = new ArrayList<>();
    }

    public static class GeneratedQuestionSpec {
        public QuestionType questionType;
        public DifficultyLevel difficulty;
        public String skillName;
        public String title;
        public String prompt;
        public int points = 10;
        public List<GeneratedOptionSpec> options = new ArrayList<>();
        public GeneratedCodingSpec codingProblem;
    }

    public static class GeneratedOptionSpec {
        public String text;
        public boolean correct;
        public String explanation;
    }

    public static class GeneratedCodingSpec {
        public String problemStatement;
        public String constraints;
        public Map<String, String> starterCodeByLang = new HashMap<>();
        public List<GeneratedTestCaseSpec> testCases = new ArrayList<>();
    }

    public static class GeneratedTestCaseSpec {
        public String input;
        public String expected;
        public boolean isHidden;
        public String explanation;
    }

    /**
     * Synthesizes an editable assessment blueprint from opportunity requirements.
     */
    public BlueprintTemplate generateBlueprint(Opportunity opportunity) {
        BlueprintTemplate blueprint = new BlueprintTemplate();
        blueprint.title = "Round-1 Technical Screening: " + opportunity.getTitle();
        blueprint.description = "Adaptive practical evaluation assessing real problem-solving, architectural concepts, and code quality for " + opportunity.getTitle() + ".";
        blueprint.timeLimitMinutes = 45;
        blueprint.passingScore = 70;

        List<String> detectedSkills = new ArrayList<>();
        if (opportunity.getSkills() != null) {
            for (OpportunitySkill os : opportunity.getSkills()) {
                if (os.getSkill() != null) {
                    detectedSkills.add(os.getSkill().getName());
                }
            }
        }
        if (detectedSkills.isEmpty()) {
            detectedSkills.addAll(List.of("Java", "SQL", "Spring Boot", "REST API Design"));
        }
        blueprint.focusAreas = detectedSkills;

        // Build questions tailored to detected skills
        blueprint.questions = buildQuestionsForSkills(detectedSkills, opportunity.getTitle());
        return blueprint;
    }

    /**
     * Instantiates the assessment in the database from an approved blueprint.
     */
    @Transactional
    public Assessment instantiateAssessment(Opportunity opportunity, BlueprintTemplate blueprint) {
        // If assessment already exists for opportunity, return existing
        Optional<Assessment> existing = assessmentRepository.findByOpportunity(opportunity);
        if (existing.isPresent()) {
            return existing.get();
        }

        String blueprintJson = "";
        try {
            blueprintJson = objectMapper.writeValueAsString(blueprint);
        } catch (Exception ignored) {}

        Assessment assessment = new Assessment(
                opportunity,
                blueprint.title != null ? blueprint.title : "Round-1 Technical Screening",
                blueprint.description != null ? blueprint.description : "Opportunity technical screening",
                blueprint.timeLimitMinutes > 0 ? blueprint.timeLimitMinutes : 45,
                blueprint.passingScore > 0 ? blueprint.passingScore : 70,
                blueprintJson
        );
        assessment = assessmentRepository.save(assessment);

        int order = 0;
        for (GeneratedQuestionSpec qSpec : blueprint.questions) {
            Skill skill = null;
            if (qSpec.skillName != null) {
                skill = skillRepository.findByNameIgnoreCase(qSpec.skillName).orElse(null);
            }

            AssessmentQuestion question = new AssessmentQuestion(
                    assessment,
                    qSpec.questionType,
                    qSpec.difficulty,
                    skill,
                    qSpec.title,
                    qSpec.prompt,
                    qSpec.points,
                    order++
            );
            question = questionRepository.save(question);

            // If question has options (MCQ, DEBUGGING, SQL, CONCEPTUAL)
            if (qSpec.options != null && !qSpec.options.isEmpty()) {
                int optOrder = 0;
                for (GeneratedOptionSpec optSpec : qSpec.options) {
                    QuestionOption option = new QuestionOption(
                            question,
                            optSpec.text,
                            optSpec.correct,
                            optSpec.explanation,
                            optOrder++
                    );
                    optionRepository.save(option);
                }
            }

            // If question is CODING
            if (qSpec.codingProblem != null) {
                String starterJson = "{}";
                try {
                    starterJson = objectMapper.writeValueAsString(qSpec.codingProblem.starterCodeByLang);
                } catch (Exception ignored) {}

                CodingProblem cp = new CodingProblem(
                        question,
                        qSpec.codingProblem.problemStatement,
                        starterJson,
                        qSpec.codingProblem.constraints,
                        "java,python,javascript,typescript,cpp,go,rust,kotlin",
                        4000,
                        256
                );
                cp = codingProblemRepository.save(cp);

                if (qSpec.codingProblem.testCases != null) {
                    int tcOrder = 0;
                    for (GeneratedTestCaseSpec tcSpec : qSpec.codingProblem.testCases) {
                        TestCase tc = new TestCase(
                                cp,
                                tcSpec.input,
                                tcSpec.expected,
                                tcSpec.isHidden,
                                tcSpec.explanation,
                                tcOrder++
                        );
                        testCaseRepository.save(tc);
                    }
                }
            }
        }

        return assessment;
    }

    private List<GeneratedQuestionSpec> buildQuestionsForSkills(List<String> skills, String roleTitle) {
        List<GeneratedQuestionSpec> specs = new ArrayList<>();
        boolean isJavaOriented = skills.stream().anyMatch(s -> s.equalsIgnoreCase("Java") || s.equalsIgnoreCase("Spring Boot"));
        boolean isPythonOriented = skills.stream().anyMatch(s -> s.equalsIgnoreCase("Python") || s.equalsIgnoreCase("FastAPI") || s.equalsIgnoreCase("Django"));

        // Question 1: Algorithmic / Data Structure Problem (CODING - Adaptive EASY/MEDIUM)
        GeneratedQuestionSpec q1 = new GeneratedQuestionSpec();
        q1.questionType = QuestionType.CODING;
        q1.difficulty = DifficultyLevel.EASY;
        q1.skillName = isJavaOriented ? "Java" : (isPythonOriented ? "Python" : "Data Structures & Algorithms");
        q1.title = "Element Frequency and Verification Counter";
        q1.prompt = "Write a function that accepts a space-separated string of words/tokens and returns the highest frequency count of any single token. Ensure duplicate tokens are counted correctly and single-character edge cases are handled.";
        q1.points = 20;

        GeneratedCodingSpec c1 = new GeneratedCodingSpec();
        c1.problemStatement = "Given a line of space-separated strings from stdin, output the integer maximum frequency of any word.\nExample:\nInput: apple banana apple orange banana apple\nOutput: 3";
        c1.constraints = "1 <= total words <= 10,000. Words contain only alphanumeric characters.";
        
        // Multi-language starter code templates
        c1.starterCodeByLang.put("java", "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (!scanner.hasNextLine()) {\n            System.out.println(0);\n            return;\n        }\n        String line = scanner.nextLine().trim();\n        if (line.isEmpty()) {\n            System.out.println(0);\n            return;\n        }\n        String[] tokens = line.split(\"\\\\s+\");\n        Map<String, Integer> freq = new HashMap<>();\n        int max = 0;\n        for (String t : tokens) {\n            int count = freq.getOrDefault(t, 0) + 1;\n            freq.put(t, count);\n            max = Math.max(max, count);\n        }\n        System.out.println(max);\n    }\n}");
        c1.starterCodeByLang.put("python", "import sys\n\ndef solve():\n    line = sys.stdin.read().strip()\n    if not line:\n        print(0)\n        return\n    tokens = line.split()\n    counts = {}\n    max_val = 0\n    for t in tokens:\n        counts[t] = counts.get(t, 0) + 1\n        if counts[t] > max_val:\n            max_val = counts[t]\n    print(max_val)\n\nif __name__ == '__main__':\n    solve()");
        c1.starterCodeByLang.put("javascript", "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (!input) {\n    console.log(0);\n    process.exit(0);\n}\nconst tokens = input.split(/\\s+/);\nconst map = {};\nlet max = 0;\nfor (const t of tokens) {\n    map[t] = (map[t] || 0) + 1;\n    if (map[t] > max) max = map[t];\n}\nconsole.log(max);");
        c1.starterCodeByLang.put("cpp", "#include <iostream>\n#include <sstream>\n#include <unordered_map>\n#include <string>\nusing namespace std;\n\nint main() {\n    string line;\n    if (!getline(cin, line) || line.empty()) {\n        cout << 0 << endl;\n        return 0;\n    }\n    stringstream ss(line);\n    string token;\n    unordered_map<string, int> freq;\n    int max_val = 0;\n    while (ss >> token) {\n        freq[token]++;\n        if (freq[token] > max_val) max_val = freq[token];\n    }\n    cout << max_val << endl;\n    return 0;\n}");
        c1.starterCodeByLang.put("go", "package main\nimport (\n    \"bufio\"\n    \"fmt\"\n    \"os\"\n    \"strings\"\n)\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if !scanner.Scan() {\n        fmt.Println(0)\n        return\n    }\n    tokens := strings.Fields(scanner.Text())\n    freq := make(map[string]int)\n    maxVal := 0\n    for _, t := range tokens {\n        freq[t]++\n        if freq[t] > maxVal { maxVal = freq[t] }\n    }\n    fmt.Println(maxVal)\n}");

        GeneratedTestCaseSpec tc1_1 = new GeneratedTestCaseSpec();
        tc1_1.input = "apple banana apple orange banana apple";
        tc1_1.expected = "3";
        tc1_1.isHidden = false;
        tc1_1.explanation = "Standard test case with word 'apple' appearing 3 times.";

        GeneratedTestCaseSpec tc1_2 = new GeneratedTestCaseSpec();
        tc1_2.input = "singleword";
        tc1_2.expected = "1";
        tc1_2.isHidden = false;
        tc1_2.explanation = "Single word edge case.";

        GeneratedTestCaseSpec tc1_3 = new GeneratedTestCaseSpec();
        tc1_3.input = "a b a c a b a d a";
        tc1_3.expected = "5";
        tc1_3.isHidden = true;
        tc1_3.explanation = "Hidden boundary test with repeated single character tokens.";

        c1.testCases = List.of(tc1_1, tc1_2, tc1_3);
        q1.codingProblem = c1;
        specs.add(q1);

        // Question 2: LeetCode #1 Algorithmic DSA Problem (CODING - EASY/MEDIUM)
        GeneratedQuestionSpec q2 = new GeneratedQuestionSpec();
        q2.questionType = QuestionType.CODING;
        q2.difficulty = DifficultyLevel.MEDIUM;
        q2.skillName = "Data Structures & Algorithms";
        q2.title = "Target Sum Pair Index Search";
        q2.prompt = "Write a function that reads an array of space-separated integers on the first line and a target integer on the second line. Find two distinct 0-indexed positions whose values sum to the target. Output the two indices separated by a space in ascending order (e.g., '0 1'). If no such pair exists, output '-1'. Optimize for O(N) time complexity using hash maps.";
        q2.points = 20;

        GeneratedCodingSpec c2 = new GeneratedCodingSpec();
        c2.problemStatement = "Given a line of space-separated integers followed by a target sum integer on the next line, output the two 0-based indices whose elements sum to target.\nExample:\nInput:\n2 7 11 15\n9\nOutput:\n0 1";
        c2.constraints = "2 <= array length <= 20,000. Exactly one valid pair exists or none.";

        c2.starterCodeByLang.put("java", "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (!scanner.hasNextLine()) { System.out.println(\"-1\"); return; }\n        String line1 = scanner.nextLine().trim();\n        if (line1.isEmpty() || !scanner.hasNextInt()) { System.out.println(\"-1\"); return; }\n        int target = scanner.nextInt();\n        String[] parts = line1.split(\"\\\\s+\");\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < parts.length; i++) {\n            int num = Integer.parseInt(parts[i]);\n            int complement = target - num;\n            if (map.containsKey(complement)) {\n                System.out.println(map.get(complement) + \" \" + i);\n                return;\n            }\n            map.put(num, i);\n        }\n        System.out.println(\"-1\");\n    }\n}");
        c2.starterCodeByLang.put("python", "import sys\n\ndef solve():\n    lines = sys.stdin.read().splitlines()\n    if len(lines) < 2: print('-1'); return\n    nums = [int(x) for x in lines[0].split()]\n    target = int(lines[1].strip())\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            print(f\"{seen[diff]} {i}\")\n            return\n        seen[num] = i\n    print('-1')\n\nif __name__ == '__main__':\n    solve()");
        c2.starterCodeByLang.put("javascript", "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length < 2) { console.log('-1'); process.exit(0); }\nconst nums = input[0].trim().split(/\\s+/).map(Number);\nconst target = Number(input[1].trim());\nconst seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (seen.has(diff)) {\n        console.log(`${seen.get(diff)} ${i}`);\n        process.exit(0);\n    }\n    seen.set(nums[i], i);\n}\nconsole.log('-1');");
        c2.starterCodeByLang.put("cpp", "#include <iostream>\n#include <sstream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    string line; if (!getline(cin, line) || line.empty()) { cout << -1 << endl; return 0; }\n    int target; if (!(cin >> target)) { cout << -1 << endl; return 0; }\n    stringstream ss(line); int val; vector<int> nums;\n    while (ss >> val) nums.push_back(val);\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (seen.count(diff)) { cout << seen[diff] << \" \" << i << endl; return 0; }\n        seen[nums[i]] = i;\n    }\n    cout << -1 << endl; return 0;\n}");
        c2.starterCodeByLang.put("go", "package main\nimport (\n    \"bufio\"\n    \"fmt\"\n    \"os\"\n    \"strconv\"\n    \"strings\"\n)\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    if !scanner.Scan() { fmt.Println(\"-1\"); return }\n    numStrs := strings.Fields(scanner.Text())\n    if !scanner.Scan() { fmt.Println(\"-1\"); return }\n    target, _ := strconv.Atoi(strings.TrimSpace(scanner.Text()))\n    seen := make(map[int]int)\n    for i, s := range numStrs {\n        n, _ := strconv.Atoi(s)\n        diff := target - n\n        if idx, ok := seen[diff]; ok {\n            fmt.Printf(\"%d %d\\n\", idx, i)\n            return\n        }\n        seen[n] = i\n    }\n    fmt.Println(\"-1\")\n}");

        GeneratedTestCaseSpec tc2_1 = new GeneratedTestCaseSpec();
        tc2_1.input = "2 7 11 15\n9";
        tc2_1.expected = "0 1";
        tc2_1.isHidden = false;
        tc2_1.explanation = "nums[0] + nums[1] == 2 + 7 == 9.";

        GeneratedTestCaseSpec tc2_2 = new GeneratedTestCaseSpec();
        tc2_2.input = "3 2 4\n6";
        tc2_2.expected = "1 2";
        tc2_2.isHidden = false;
        tc2_2.explanation = "nums[1] + nums[2] == 2 + 4 == 6.";

        GeneratedTestCaseSpec tc2_3 = new GeneratedTestCaseSpec();
        tc2_3.input = "1 5 8 12 20 33\n25";
        tc2_3.expected = "1 4";
        tc2_3.isHidden = true;
        tc2_3.explanation = "Hidden case: nums[1] + nums[4] == 5 + 20 == 25.";

        c2.testCases = List.of(tc2_1, tc2_2, tc2_3);
        q2.codingProblem = c2;
        specs.add(q2);

        // Question 3: Architecture & Concurrency / Debugging (DEBUGGING / CONCEPTUAL)
        GeneratedQuestionSpec q3 = new GeneratedQuestionSpec();
        q3.questionType = QuestionType.DEBUGGING;
        q3.difficulty = DifficultyLevel.MEDIUM;
        q3.skillName = isJavaOriented ? "Spring Boot" : "REST API Design";
        q3.title = "Concurrent State Leak in Singleton Service";
        q3.prompt = "In a standard Spring or web backend service, a developer wrote the following singleton bean:\n\n```java\n@Service\npublic class UserSessionProcessor {\n    private Long currentUserId; // Instance state\n    public void process(Long userId) {\n        this.currentUserId = userId;\n        auditService.record(this.currentUserId);\n    }\n}\n```\nWhat critical vulnerability or defect will occur under multi-threaded load?";
        q3.points = 20;

        GeneratedOptionSpec q3_o1 = new GeneratedOptionSpec();
        q3_o1.text = "Race condition leading to cross-request user session data corruption, because Spring service beans are singletons by default.";
        q3_o1.correct = true;
        q3_o1.explanation = "Spring singleton beans are shared across all worker threads. Storing request-specific mutable state in an instance field causes race conditions and data leaks.";

        GeneratedOptionSpec q3_o2 = new GeneratedOptionSpec();
        q3_o2.text = "OutOfMemoryError due to JVM thread stack overflow.";
        q3_o2.correct = false;
        q3_o2.explanation = "An instance field assignment does not cause stack recursion.";

        GeneratedOptionSpec q3_o3 = new GeneratedOptionSpec();
        q3_o3.text = "Deadlock between the auditService and UserSessionProcessor.";
        q3_o3.correct = false;
        q3_o3.explanation = "There are no synchronized blocks or mutexes causing deadlocks here.";

        q3.options = List.of(q3_o1, q3_o2, q3_o3);
        specs.add(q3);

        // Question 4: SQL / Relational Data Modeling (SQL)
        GeneratedQuestionSpec q4 = new GeneratedQuestionSpec();
        q4.questionType = QuestionType.SQL;
        q4.difficulty = DifficultyLevel.MEDIUM;
        q4.skillName = "SQL";
        q4.title = "Relational Aggregation: Active Opportunity Matches";
        q4.prompt = "Given two tables:\n`opportunities(id, title, status, recruiter_id)`\n`applications(id, opportunity_id, candidate_id, status)`\n\nWhich query correctly returns the opportunity title and count of accepted candidates for all PUBLISHED opportunities, including those with 0 accepted candidates?";
        q4.points = 20;

        GeneratedOptionSpec q4_o1 = new GeneratedOptionSpec();
        q4_o1.text = "SELECT o.title, COUNT(a.id) FROM opportunities o LEFT JOIN applications a ON o.id = a.opportunity_id AND a.status = 'ACCEPTED' WHERE o.status = 'PUBLISHED' GROUP BY o.id, o.title;";
        q4_o1.correct = true;
        q4_o1.explanation = "A LEFT JOIN with the status filter in the ON clause preserves published opportunities that currently have zero accepted applications.";

        GeneratedOptionSpec q4_o2 = new GeneratedOptionSpec();
        q4_o2.text = "SELECT o.title, COUNT(a.id) FROM opportunities o INNER JOIN applications a ON o.id = a.opportunity_id WHERE a.status = 'ACCEPTED' AND o.status = 'PUBLISHED' GROUP BY o.title;";
        q4_o2.correct = false;
        q4_o2.explanation = "INNER JOIN filters out opportunities with 0 applications, violating the requirement.";

        GeneratedOptionSpec q4_o3 = new GeneratedOptionSpec();
        q4_o3.text = "SELECT o.title, SUM(a.id) FROM opportunities o FULL OUTER JOIN applications a ON o.id = a.opportunity_id GROUP BY o.title;";
        q4_o3.correct = false;
        q4_o3.explanation = "SUM(a.id) sums primary keys rather than counting rows, and FULL OUTER JOIN introduces null opportunity records.";

        q4.options = List.of(q4_o1, q4_o2, q4_o3);
        specs.add(q4);

        // Question 5: System Design & API Contract (CONCEPTUAL)
        GeneratedQuestionSpec q5 = new GeneratedQuestionSpec();
        q5.questionType = QuestionType.CONCEPTUAL;
        q5.difficulty = DifficultyLevel.HARD;
        q5.skillName = "REST API Design";
        q5.title = "Idempotency in Critical API Operations";
        q5.prompt = "When designing a payment or verification submission endpoint `POST /api/verifications`, how should idempotency be achieved against transient network retry storms?";
        q5.points = 20;

        GeneratedOptionSpec q5_o1 = new GeneratedOptionSpec();
        q5_o1.text = "Require an `Idempotency-Key` header with unique UUID from the client, store the key in Redis/DB with TTL, and return the cached response on duplicate attempts.";
        q5_o1.correct = true;
        q5_o1.explanation = "Standard distributed systems pattern: Idempotency keys prevent duplicate execution of non-idempotent HTTP POST operations.";

        GeneratedOptionSpec q5_o2 = new GeneratedOptionSpec();
        q5_o2.text = "Change the HTTP method from POST to GET.";
        q5_o2.correct = false;
        q5_o2.explanation = "GET requests must be safe and must not create or modify server resources.";

        GeneratedOptionSpec q5_o3 = new GeneratedOptionSpec();
        q5_o3.text = "Increase the client request timeout to 120 seconds to eliminate retries.";
        q5_o3.correct = false;
        q5_o3.explanation = "Increasing timeouts degrades user experience and does not prevent network disconnection retries.";

        q5.options = List.of(q5_o1, q5_o2, q5_o3);
        specs.add(q5);

        return specs;
    }
}
