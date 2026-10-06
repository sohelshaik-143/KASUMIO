package com.kasumio.assessment.dto;

public class RunCodeRequest {
    private String language;
    private String code;
    private String customInput;

    public RunCodeRequest() {}

    public RunCodeRequest(String language, String code, String customInput) {
        this.language = language;
        this.code = code;
        this.customInput = customInput;
    }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getCustomInput() { return customInput; }
    public void setCustomInput(String customInput) { this.customInput = customInput; }
}
