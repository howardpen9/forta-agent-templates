# Forta Agent Templates

This repository contains premade agent templates designed to help rapidly develop and deploy Forta agents.

## Agent Templates

### Administrative/Governance Events

This agent monitors blockchain transactions for specific events emitted from specific contract addresses.  Alert 
type and severity are specified per event per contract address.  An existing agent of this type may be modified 
to add/remove/update events and contracts in the agent configuration file.

### Function Calls

This agent monitors blockchain transactions for specific function calls called from specific contract
addresses. Alert type and severity are specified per function per contract address. An existing agent
of this type may be modified to add/remove/update functions and contracts in the agent configuration
file.
