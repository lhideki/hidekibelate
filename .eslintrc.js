module.exports = {
    extends: 'standard',
    env: {
        browser: true,
    	node: true
    },
    ecmaFeatures: {
    	jsx: true
    },
    plugins: [
    	'react'
    ],
    rules: {
        'react/jsx-uses-vars': 1
    }
}
