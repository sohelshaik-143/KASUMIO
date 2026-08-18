package com.kasumio.discovery.dto;

import java.util.List;

public class TechnologyCatalogDto {
    private Long id;
    private String name;
    private String category;
    private String subcategory;
    private String ecosystem;
    private String canonicalName;
    private List<String> aliases;

    public TechnologyCatalogDto() {}

    public TechnologyCatalogDto(Long id, String name, String category, String subcategory,
                                String ecosystem, String canonicalName, List<String> aliases) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.subcategory = subcategory;
        this.ecosystem = ecosystem;
        this.canonicalName = canonicalName;
        this.aliases = aliases;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getSubcategory() { return subcategory; }
    public String getEcosystem() { return ecosystem; }
    public String getCanonicalName() { return canonicalName; }
    public List<String> getAliases() { return aliases; }
}
