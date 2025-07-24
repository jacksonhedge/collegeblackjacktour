// User type definitions
const PhoneNumber = {
  number: '',
  verified: false,
  primary: false,
  dateAdded: new Date()
};

const UserIdentifiers = {
  username: '',        // Required, unique, prefixed with #
  phoneNumbers: [],    // Array of PhoneNumber objects
  sleeperUsername: null,  // Optional but unique if present
  venmoUsername: null     // Optional but unique if present
};

const User = {
  id: '',
  email: '',
  identifiers: UserIdentifiers,
  firstName: '',
  lastName: ''
};

export { User, UserIdentifiers, PhoneNumber };

/*
Firebase security rules for enforcing uniqueness:
{
  "rules": {
    "users": {
      ".indexOn": ["identifiers/username", "identifiers/sleeperUsername", "identifiers/venmoUsername"],
      "$uid": {
        ".validate": "
          // Username validation
          newData.child('identifiers/username').isString() &&
          newData.child('identifiers/username').val().startsWith('#') &&
          !root.child('users').orderByChild('identifiers/username').equalTo(newData.child('identifiers/username').val()).exists() &&
          
          // Phone numbers validation
          (!newData.child('identifiers/phoneNumbers').exists() || 
            !root.child('users').orderByChild('identifiers/phoneNumbers/number')
            .equalTo(newData.child('identifiers/phoneNumbers/number').val()).exists()) &&
          
          // Sleeper username validation (if present)
          (!newData.child('identifiers/sleeperUsername').exists() ||
            !root.child('users').orderByChild('identifiers/sleeperUsername')
            .equalTo(newData.child('identifiers/sleeperUsername').val()).exists()) &&
          
          // Venmo username validation (if present)
          (!newData.child('identifiers/venmoUsername').exists() ||
            !root.child('users').orderByChild('identifiers/venmoUsername')
            .equalTo(newData.child('identifiers/venmoUsername').val()).exists())
        "
      }
    }
  }
}
*/
