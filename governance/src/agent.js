// VoteCast Tx: 0x4f8f3d7827467229caffb8570a9b38aa78448ca358863d7ad17ea4a75673745d
// ProposalCreated Tx: 0x46fb3ad1837ca8fbbd88e6654424752faa20430fab0517c2d965b26759292d4b
// ProposalExecuted Tx: 0xd1924e6d2b04303262fe90d6a354f92d795a6ce4bd7908cd77869aae50e77f43
// ProposalQueued Tx: 0x1a9692a039baebcedc28b13447e3528a6a469b8ae9e8241df14f50a5cbad25dd
// ProposalCanceled Tx: 0xc09ea70ee0f2e05eff9ff63b09195a6714681c18a145c019de8e5fbc9e01e675
const { Finding, ethers, getEthersProvider } = require('forta-agent');

const config = require('../agent-config.json');

const { getAbi, createProposalFromLog } = require('./utils');

// set up a variable to hold initialization data used in the handler
const initializeData = {};

// alert for when a new governance proposal is created
function proposalCreatedFinding(proposal, address, devAbbr, protAbbr, protName) {
  return Finding.fromObject({
    name: `${protName} Governance Proposal Created`,
    description: `Governance Proposal ${proposal.proposalId} was just created`,
    alertId: `${devAbbr}-${protAbbr}-PROPOSAL-CREATED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      ...proposal,
    },
  });
}

function voteCastFinding(voteInfo, address, devAbbr, protAbbr, protName) {
  let description = `Vote cast with weight ${voteInfo.weight.toString()}`;
  switch (voteInfo.support) {
    case 0:
      description += ' against';
      break;
    case 1:
      description += ' in support of';
      break;
    case 2:
      description += ' abstaining from';
      break;
    default:
      description += ` with unknown support "${voteInfo.support}" for`;
  }
  description += ` proposal ${voteInfo.proposalId}`;

  return Finding.fromObject({
    name: `${protName} Governance Proposal Vote Cast`,
    description,
    alertId: `${devAbbr}-${protAbbr}-VOTE-CAST`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      voter: voteInfo.voter,
      weight: voteInfo.weight.toString(),
      reason: voteInfo.reason,
    },
  });
}

function proposalCanceledFinding(proposalId, address, devAbbr, protAbbr, protName) {
  return Finding.fromObject({
    name: `${protName} Governance Proposal Canceled`,
    description: `Governance proposal ${proposalId} has been canceled`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-PROPOSAL-CANCELED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
    },
  });
}

function proposalExecutedFinding(proposalId, address, devAbbr, protAbbr, protName) {
  return Finding.fromObject({
    name: `${protName} Governance Proposal Executed`,
    description: `Governance proposal ${proposalId} has been executed`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-PROPOSAL-EXECUTED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
    },
  });
}

function proposalQueuedFinding(proposalId, address, devAbbr, protAbbr, protName, eta) {
  return Finding.fromObject({
    name: `${protName} Governance Proposal Queued`,
    description: `Governance Proposal ${proposalId} has been queued`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-PROPOSAL-QUEUED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      eta,
    },
  });
}

function quorumNumeratorUpdatedFinding(address, devAbbr, protAbbr, protName, oldNum, newNum) {
  return Finding.fromObject({
    name: `${protName} Governance Quorum Numerator Updated`,
    description: `Quorum numerator updated from ${oldNum} to ${newNum}`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-QUORUM-NUMERATOR-UPDATED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      oldNumerator: oldNum,
      newNumerator: newNum,
    },
  });
}

function timelockChangeFinding(address, devAbbr, protAbbr, protName, oldAddress, newAddress) {
  return Finding.fromObject({
    name: `${protName} Governance Timelock Address Change`,
    description: `Timelock address changed from ${oldAddress} to ${newAddress}`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-TIMELOCK-ADDRESS-CHANGED`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      oldTimelockAddress: oldAddress,
      newTimelockAddress: newAddress,
    },
  });
}

function votingDelaySetFinding(address, devAbbr, protAbbr, protName, oldDelay, newDelay) {
  return Finding.fromObject({
    name: `${protName} Governance Voting Delay Set`,
    description: `Voting delay change from ${oldDelay} to ${newDelay}`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-VOTING-DELAY-SET`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      oldVotingDelay: oldDelay,
      newVotingDelay: newDelay,
    },
  });
}

function votingPeriodSetFinding(address, devAbbr, protAbbr, protName, oldPeriod, newPeriod) {
  return Finding.fromObject({
    name: `${protName} Governance Voting Period Set`,
    description: `Voting period change from ${oldPeriod} to ${newPeriod}`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-VOTING-PERIOD-SET`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      oldVotingPeriod: oldPeriod,
      newVotingPeriod: newPeriod,
    },
  });
}

function proposalThresholdSetFinding(address, devAbbr, protAbbr, protName, oldThresh, newThresh) {
  return Finding.fromObject({
    name: `${protName} Governance Proposal Threshold Set`,
    description: `Proposal threshold change from ${oldThresh} to ${newThresh}`,
    alertId: `${devAbbr}-${protAbbr}-GOVERNANCE-PROPOSAL-THRESHOLD-SET`,
    type: 'Info',
    severity: 'Info',
    protocol: protName,
    metadata: {
      address,
      oldThreshold: oldThresh,
      newThreshold: newThresh,
    },
  });
}

function provideInitialize(data) {
  return async function initialize() {
    /* eslint-disable no-param-reassign */
    data.developerAbbreviation = config.developerAbbreviation;
    data.protocolName = config.protocolName;
    data.protocolAbbreviation = config.protocolAbbreviation;
    data.address = config.governance.address;

    const { abiFile } = config.governance;
    data.abi = getAbi(abiFile);

    const iface = new ethers.utils.Interface(data.abi);

    const names = Object.keys(iface.events);
    const ftype = ethers.utils.FormatTypes.full;
    data.eventSignatures = names.map((name) => iface.getEvent(name).format(ftype));

    // set up an ethers contract object to interact with the contract
    data.contract = new ethers.Contract(data.address, data.abi, getEthersProvider());

    /* eslint-enable no-param-reassign */
  };
}

function provideHandleTransaction(data) {
  return async function handleTransaction(txEvent) {
    const {
      developerAbbreviation,
      protocolName,
      protocolAbbreviation,
      address,
      eventSignatures,
      contract,
    } = data;

    const findings = [];

    const logs = txEvent.filterLog(eventSignatures, address);

    // iterate over all logs to determine what governance actions were taken
    let results = logs.map((log) => {
      let proposal;
      let voteInfo;
      switch (log.name) {
        case 'ProposalCreated':
          // create a finding for a new proposal
          proposal = createProposalFromLog(log);
          return proposalCreatedFinding(
            proposal,
            address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
          );
        case 'VoteCast':
          // add the vote to the corresponding proposal object
          voteInfo = {
            voter: log.args.voter,
            proposalId: log.args.proposalId.toString(),
            support: log.args.support,
            weight: log.args.weight,
            reason: log.args.reason,
          };
          // create a finding indicating that the vote was cast
          return voteCastFinding(
            voteInfo,
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
          );
        case 'ProposalCanceled':
          // create a finding indicating that the proposal has been canceled,
          return proposalCanceledFinding(
            log.args.proposalId.toString(),
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
          );
        case 'ProposalExecuted':
          // create a finding indicating that the proposal has been executed,
          return proposalExecutedFinding(
            log.args.proposalId.toString(),
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
          );
        case 'QuorumNumeratorUpdated':
          return quorumNumeratorUpdatedFinding(
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.oldQuorumNumerator.toString(),
            log.args.newQuorumNumerator.toString(),
          );
        case 'ProposalQueued':
          return proposalQueuedFinding(
            log.args.proposalId.toString(),
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.eta.toString(),
          );
        case 'TimelockChange':
          return timelockChangeFinding(
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.oldTimelock,
            log.args.newTimelock,
          );
        case 'VotingDelaySet':
          return votingDelaySetFinding(
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.oldVotingDelay.toString(),
            log.args.newVotingDelay.toString(),
          );
        case 'VotingPeriodSet':
          return votingPeriodSetFinding(
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.oldVotingDelay.toString(),
            log.args.newVotingDelay.toString(),
          );
        case 'ProposalThresholdSet':
          return proposalThresholdSetFinding(
            contract.address,
            developerAbbreviation,
            protocolAbbreviation,
            protocolName,
            log.args.oldProposalThreshold.toString(),
            log.args.newProposalThreshold.toString(),
          );
        default:
          return [];
      }
    });

    results = results.filter((result) => result !== []);

    findings.push(...(results.flat()));

    return findings;
  };
}

module.exports = {
  provideInitialize,
  initialize: provideInitialize(initializeData),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(initializeData),
};
