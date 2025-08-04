// Expanded fraternity list with full names and abbreviations
// This matches the format shown in the admin forms
export const fraternityOptions = [
  { value: '', label: 'Select a fraternity' },
  { value: 'delta-chi', label: 'Delta Chi' },
  { value: 'dke', label: 'DKE (Delta Kappa Epsilon)' },
  { value: 'kappa-sig', label: 'Kappa Sig' },
  { value: 'no-fraternity', label: 'No fraternities yet' },
  { value: 'phi-tau', label: 'Phi Tau' },
  { value: 'pike', label: 'Pike (Pi Kappa Alpha)' },
  { value: 'pkt', label: 'PKT' },
  { value: 'sae', label: 'SAE (Sigma Alpha Epsilon)' },
  { value: 'sigma-chi', label: 'Sigma Chi' },
  { value: 'tke', label: 'TKE (Tau Kappa Epsilon)' },
  // Expanded list of fraternities
  { value: 'acacia', label: 'Acacia' },
  { value: 'aepi', label: 'AEPi (Alpha Epsilon Pi)' },
  { value: 'agr', label: 'AGR (Alpha Gamma Rho)' },
  { value: 'alpha-chi-rho', label: 'Alpha Chi Rho' },
  { value: 'alpha-delta-phi', label: 'Alpha Delta Phi' },
  { value: 'alpha-kappa-lambda', label: 'Alpha Kappa Lambda' },
  { value: 'alpha-phi-alpha', label: 'Alpha Phi Alpha' },
  { value: 'alpha-sig', label: 'Alpha Sig (Alpha Sigma Phi)' },
  { value: 'ato', label: 'ATO (Alpha Tau Omega)' },
  { value: 'beta', label: 'Beta (Beta Theta Pi)' },
  { value: 'chi-phi', label: 'Chi Phi' },
  { value: 'chi-psi', label: 'Chi Psi' },
  { value: 'delt', label: 'Delt (Delta Tau Delta)' },
  { value: 'delta-sig', label: 'Delta Sig (Delta Sigma Phi)' },
  { value: 'du', label: 'DU (Delta Upsilon)' },
  { value: 'farmhouse', label: 'FarmHouse' },
  { value: 'fiji', label: 'FIJI (Phi Gamma Delta)' },
  { value: 'ka', label: 'KA (Kappa Alpha Order)' },
  { value: 'kappa-alpha-psi', label: 'Kappa Alpha Psi' },
  { value: 'kdr', label: 'KDR (Kappa Delta Rho)' },
  { value: 'lambda-chi', label: 'Lambda Chi (Lambda Chi Alpha)' },
  { value: 'omega-psi-phi', label: 'Omega Psi Phi' },
  { value: 'phi-delt', label: 'Phi Delt (Phi Delta Theta)' },
  { value: 'phi-kappa-sigma', label: 'Phi Kappa Sigma' },
  { value: 'phi-kappa-theta', label: 'Phi Kappa Theta' },
  { value: 'phi-mu-delta', label: 'Phi Mu Delta' },
  { value: 'phi-psi', label: 'Phi Psi (Phi Kappa Psi)' },
  { value: 'phi-sig', label: 'Phi Sig (Phi Sigma Kappa)' },
  { value: 'phi-sigma-phi', label: 'Phi Sigma Phi' },
  { value: 'pi-kapp', label: 'Pi Kapp (Pi Kappa Phi)' },
  { value: 'psi-u', label: 'Psi U (Psi Upsilon)' },
  { value: 'sammy', label: 'Sammy (Sigma Alpha Mu)' },
  { value: 'sig-ep', label: 'Sig Ep (Sigma Phi Epsilon)' },
  { value: 'sig-nu', label: 'Sig Nu (Sigma Nu)' },
  { value: 'sig-pi', label: 'Sig Pi (Sigma Pi)' },
  { value: 'sig-tau', label: 'Sig Tau (Sigma Tau Gamma)' },
  { value: 'sigma-phi', label: 'Sigma Phi' },
  { value: 'skulls', label: 'Skulls (Phi Kappa Sigma)' },
  { value: 'tau-ep', label: 'Tau Ep (Tau Epsilon Phi)' },
  { value: 'tdx', label: 'TDX (Theta Delta Chi)' },
  { value: 'theta-chi', label: 'Theta Chi' },
  { value: 'theta-xi', label: 'Theta Xi' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'zbt', label: 'ZBT (Zeta Beta Tau)' },
  { value: 'zeta-psi', label: 'Zeta Psi' }
];

// Export just the labels for backwards compatibility
export const fraternityList = fraternityOptions
  .filter(f => f.value !== '' && f.value !== 'no-fraternity')
  .map(f => f.label);

// Helper function to get fraternity by value
export const getFraternityByValue = (value) => {
  return fraternityOptions.find(f => f.value === value);
};

// Helper function to get fraternity by label
export const getFraternityByLabel = (label) => {
  return fraternityOptions.find(f => f.label === label);
};

// Export default for easier importing
export default fraternityOptions;