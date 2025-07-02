import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  // 프로젝트의 빌드 폴더(예: dist) 무시
  { ignores: ['dist'] },

  {
    // .js, .jsx 파일에 대한 설정
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: eslintPluginImport, // 임포트 관련 플러그인 추가
    },
    rules: {
      // 기본 eslint 규칙
      ...js.configs.recommended.rules,

      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,

      // 사용되지 않은 변수에 대한 경고 (상수는 무시)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // React Refresh 설정
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // 임포트 규칙 설정
      'import/no-unresolved': 'error', // 임포트 경로 오류 잡기
      'import/order': ['warn', { 'newlines-between': 'always' }], // 임포트 순서 규칙

      // JSX에서 사용된 변수 인식
      'react/jsx-uses-vars': 'warn', // JSX 안에서 사용된 변수로 인식

      // React 17+ 자동 JSX 변환용 설정
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off', // React 17+ 불필요
    },
    settings: {
      react: {
        version: 'detect', // 자동으로 React 버전 감지
      },
      'import/resolver': {
        alias: {
          map: [['@', './src']], // `@` alias로 src/ 경로를 사용하도록 설정
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
];
