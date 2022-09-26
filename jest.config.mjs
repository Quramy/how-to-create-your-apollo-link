export default {
  transform: {
    "^.+\\.ts$": ["ts-jest", { diagnostics: false }],
  },
  testRegex: "(src/.*\\.test)\\.ts$",
  testPathIgnorePatterns: ["/node_modules/", "\\.d\\.ts$", "lib/.*"],
  watchPathIgnorePatterns: ["lib/.*"],
  moduleFileExtensions: ["js", "ts", "json"],
}
