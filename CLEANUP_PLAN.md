# Repository Cleanup Plan

## 🧹 What to Remove

### 1. Reference Source Code
- `swisseph-master 2/` - Complete C source code reference (not needed for Node.js app)
- This contains the original Swiss Ephemeris C implementation
- We're using the npm `swisseph` package instead

### 2. System Files
- `.DS_Store` - macOS system files
- Any other `.DS_Store` files in subdirectories

### 3. Redundant Files
- `download-ephe.js` - We already have the ephemeris files downloaded
- `src/example.ts` and `src/test-swisseph.ts` - Test files (if they exist)

## 📁 What to Keep

### 1. Core Application
- `src/` - Our TypeScript source code
- `public/` - Web interface files
- `package.json` - Dependencies and scripts
- `tsconfig.json` and `tsconfig.client.json` - TypeScript configs
- `README.md` - Project documentation

### 2. Essential Data
- `ephe/` - Ephemeris data files (`.se1`, `.se1m` files)
- These are the actual astronomical data needed for calculations

### 3. Documentation
- `SWISSEPH_README.md` - Useful reference for Swiss Ephemeris usage
- `README.md` - Project documentation

## 🚀 Potential Enhancements from Reference

### 1. Additional Ephemeris Files
From `swisseph-master 2/ephe/` we could potentially add:
- More asteroid files for expanded calculations
- Additional planetary files if needed

### 2. Documentation
- `swisseph-master 2/doc/` contains comprehensive documentation
- Could extract useful examples or reference material

### 3. Examples
- `swisseph-master 2/swetest.c` shows many calculation examples
- Could inspire additional features for our app

## 📋 Cleanup Steps

1. Remove `swisseph-master 2/` directory
2. Remove `.DS_Store` files
3. Remove `download-ephe.js`
4. Update `.gitignore` to prevent future `.DS_Store` files
5. Consider extracting any useful documentation or examples
6. Test that everything still works after cleanup

## 🎯 Benefits

- **Smaller Repository**: Remove ~100MB+ of unnecessary files
- **Cleaner Structure**: Focus on what's actually needed
- **Better Performance**: Faster git operations
- **Easier Maintenance**: Less clutter to manage
