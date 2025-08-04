// Complete list of NIC member fraternities with proper formatting
export const fraternityOptions = [
  { value: '', label: 'Select a fraternity' },
  { value: 'no-fraternity', label: 'No fraternities yet' },
  
  // Alphabetical listing of all fraternities
  { value: 'acacia', label: 'Acacia' },
  { value: 'alpha-chi-rho', label: 'Alpha Chi Rho (ΑΧΡ)' },
  { value: 'alpha-delta-gamma', label: 'Alpha Delta Gamma (ΑΔΓ)' },
  { value: 'alpha-delta-phi', label: 'Alpha Delta Phi (ΑΔΦ)' },
  { value: 'agr', label: 'Alpha Gamma Rho (ΑΓΡ)' },
  { value: 'akl', label: 'Alpha Kappa Lambda (ΑΚΛ)' },
  { value: 'alpha-phi-alpha', label: 'Alpha Phi Alpha (ΑΦΑ)' },
  { value: 'ato', label: 'Alpha Tau Omega (ΑΤΩ)' },
  { value: 'beta-chi-theta', label: 'Beta Chi Theta (ΒΧΘ)' },
  { value: 'beta-sigma-psi', label: 'Beta Sigma Psi (ΒΣΨ)' },
  { value: 'beta', label: 'Beta Theta Pi (ΒΘΠ)' },
  { value: 'beta-upsilon-chi', label: 'Beta Upsilon Chi (ΒΥΧ)' },
  { value: 'chi-phi', label: 'Chi Phi (ΧΦ)' },
  { value: 'chi-psi', label: 'Chi Psi (ΧΨ)' },
  { value: 'delta-chi', label: 'Delta Chi (ΔΧ)' },
  { value: 'dke', label: 'Delta Kappa Epsilon (ΔΚΕ)' },
  { value: 'delta-lambda-phi', label: 'Delta Lambda Phi (ΔΛΦ)' },
  { value: 'delta-phi', label: 'Delta Phi (ΔΦ)' },
  { value: 'delta-sig', label: 'Delta Sigma Phi (ΔΣΦ)' },
  { value: 'delt', label: 'Delta Tau Delta (ΔΤΔ)' },
  { value: 'du', label: 'Delta Upsilon (ΔΥ)' },
  { value: 'farmhouse', label: 'FarmHouse (FH)' },
  { value: 'iota-nu-delta', label: 'Iota Nu Delta (ΙΝΔ)' },
  { value: 'iota-phi-theta', label: 'Iota Phi Theta (ΙΦΘ)' },
  { value: 'kappa-alpha-psi', label: 'Kappa Alpha Psi (ΚΑΨ)' },
  { value: 'ka-society', label: 'Kappa Alpha Society (ΚΑ Society)' },
  { value: 'kappa-delta-phi', label: 'Kappa Delta Phi (ΚΔΦ)' },
  { value: 'kdr', label: 'Kappa Delta Rho (ΚΔΡ)' },
  { value: 'lambda-alpha-upsilon', label: 'Lambda Alpha Upsilon (ΛAΥ)' },
  { value: 'lambda-chi', label: 'Lambda Chi Alpha (ΛΧΑ)' },
  { value: 'lambda-sigma-upsilon', label: 'Lambda Sigma Upsilon (ΛΣΥ)' },
  { value: 'lambda-theta-phi', label: 'Lambda Theta Phi (ΛΘΦ)' },
  { value: 'nu-alpha-kappa', label: 'Nu Alpha Kappa (ΝΑΚ)' },
  { value: 'omega-delta-phi', label: 'Omega Delta Phi (ΩΔΦ)' },
  { value: 'fiji', label: 'Phi Gamma Delta / FIJI (ΦΓΔ)' },
  { value: 'phi-iota-alpha', label: 'Phi Iota Alpha (ΦΙΑ)' },
  { value: 'phi-psi', label: 'Phi Kappa Psi (ΦΚΨ)' },
  { value: 'skulls', label: 'Phi Kappa Sigma (ΦΚΣ)' },
  { value: 'phi-tau', label: 'Phi Kappa Tau (ΦΚΤ)' },
  { value: 'phi-kappa-theta', label: 'Phi Kappa Theta (ΦΚΘ)' },
  { value: 'phi-mu-delta', label: 'Phi Mu Delta (ΦΜΔ)' },
  { value: 'phi-sig', label: 'Phi Sigma Kappa (ΦΣΚ)' },
  { value: 'phi-sigma-phi', label: 'Phi Sigma Phi (ΦΣΦ)' },
  { value: 'pike', label: 'Pi Kappa Alpha (ΠΚΑ)' },
  { value: 'pi-kapp', label: 'Pi Kappa Phi (ΠΚΦ)' },
  { value: 'pi-lambda-phi', label: 'Pi Lambda Phi (ΠΛΦ)' },
  { value: 'psi-u', label: 'Psi Upsilon (ΨΥ)' },
  { value: 'sae', label: 'Sigma Alpha Epsilon (ΣΑΕ)' },
  { value: 'sammy', label: 'Sigma Alpha Mu (ΣΑΜ)' },
  { value: 'sigma-beta-rho', label: 'Sigma Beta Rho (ΣΒΡ)' },
  { value: 'sigma-chi', label: 'Sigma Chi (ΣΧ)' },
  { value: 'sig-nu', label: 'Sigma Nu (ΣΝ)' },
  { value: 'sig-tau', label: 'Sigma Tau Gamma (ΣΤΓ)' },
  { value: 'tau-delta-phi', label: 'Tau Delta Phi (ΤΔΦ)' },
  { value: 'tep', label: 'Tau Epsilon Phi (ΤΕΦ)' },
  { value: 'theta-xi', label: 'Theta Xi (ΘΞ)' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'zbt', label: 'Zeta Beta Tau (ΖΒΤ)' },
  { value: 'zeta-psi', label: 'Zeta Psi (ΖΨ)' }
];

// Common abbreviations/nicknames mapped to full names
export const fraternityNicknames = {
  'ATO': 'Alpha Tau Omega (ΑΤΩ)',
  'Beta': 'Beta Theta Pi (ΒΘΠ)',
  'DKE': 'Delta Kappa Epsilon (ΔΚΕ)',
  'Delt': 'Delta Tau Delta (ΔΤΔ)',
  'DU': 'Delta Upsilon (ΔΥ)',
  'FIJI': 'Phi Gamma Delta / FIJI (ΦΓΔ)',
  'KA': 'Kappa Alpha Society (ΚΑ Society)',
  'KDR': 'Kappa Delta Rho (ΚΔΡ)',
  'Lambda Chi': 'Lambda Chi Alpha (ΛΧΑ)',
  'Phi Delt': 'Phi Delta Theta',
  'Phi Psi': 'Phi Kappa Psi (ΦΚΨ)',
  'Phi Sig': 'Phi Sigma Kappa (ΦΣΚ)',
  'Phi Tau': 'Phi Kappa Tau (ΦΚΤ)',
  'Pike': 'Pi Kappa Alpha (ΠΚΑ)',
  'Pi Kapp': 'Pi Kappa Phi (ΠΚΦ)',
  'Psi U': 'Psi Upsilon (ΨΥ)',
  'SAE': 'Sigma Alpha Epsilon (ΣΑΕ)',
  'Sammy': 'Sigma Alpha Mu (ΣΑΜ)',
  'Sig Chi': 'Sigma Chi (ΣΧ)',
  'Sig Nu': 'Sigma Nu (ΣΝ)',
  'Sig Tau': 'Sigma Tau Gamma (ΣΤΓ)',
  'Skulls': 'Phi Kappa Sigma (ΦΚΣ)',
  'TEP': 'Tau Epsilon Phi (ΤΕΦ)',
  'ZBT': 'Zeta Beta Tau (ΖΒΤ)'
};

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

// Helper function to search fraternities (partial match)
export const searchFraternities = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return fraternityOptions.filter(f => 
    f.label.toLowerCase().includes(term) || 
    f.value.toLowerCase().includes(term)
  );
};

// Export default for easier importing
export default fraternityOptions;