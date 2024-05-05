module.exports = {
    env: {
      node: true,
    },
    extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
    parser: 'espree',
    parserOptions: {
      ecmaVersion: 2020, // Ajustez la version ECMAScript en fonction de votre projet
      sourceType: 'module',
    },
    plugins: ['import', 'node', 'prettier'],
    rules: {
      'no-console': 'warn', // Autorise console.log avec un avertissement
      'no-unused-vars': 'warn', // Avertissement pour les variables inutilisées
      'prettier/prettier': 'error', // Erreur si le code ne respecte pas le formatage Prettier
    },
  };
  