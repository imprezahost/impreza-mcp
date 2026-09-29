# MCP 0.46.0

- The local package reaches parity with the hosted connector: 184 tools on both
  sides. It gains the 16 tools that were hosted-only:
  - projects and environments: rename and delete;
  - variable groups: read and replace;
  - configuration promotion: prepare, review and apply;
  - ordered environment deploys: start, follow and list;
  - agent update policy and update requests;
  - the Shield profile.
- Tool annotations match the hosted connector. A destructive tool called with
  `confirm` missing or false is refused before any request is sent.
