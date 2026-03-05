name: Task Template
description: Basic task template with Acceptance Criteria and Out of Scope
title: "[TASK]"
labels: ["task"]
body:
  - type: markdown
    attributes:
      value: "**Acceptance Criteria**"
  
  - type: textarea
    id: acceptance-criteria
    attributes:
      label: ""
      value: |
        - [ ]
    validations:
      required: true

  - type: markdown
    attributes:
      value: "**Out of Scope**"
  
  - type: textarea
    id: out-of-scope
    attributes:
      label: ""
      value: ""
        
    validations:
      required: false
