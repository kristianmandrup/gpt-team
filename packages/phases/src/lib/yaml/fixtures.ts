export const phasesYaml = `
phases:
  analysis:
    goal: 'analyse project'
    tasks:
      use-cases:
        location: tasks
        configFile: use-cases.yml    
      design:
        channels:
          subscriptions: 
            - ui
        messages:
          - hello world
  development:
    configFile: development.yml
    `;

export const developmentYaml = `
  goal: 'develop project'
  tasks:
    structure:
      channels:
        subscriptions: 
          - analysis
      messages:
      - define the project structure
  
    components:
      channels:
        subscriptions: 
          - analysis
      messages:
        - determine the main components required

    `;

export const useCasesYaml = `
  channels:
    subscriptions: 
      - analysis
  messages:
    - determine the main actors
    - create use case diagrams with actors

    `;
