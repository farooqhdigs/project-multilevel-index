# VSCode Extension - Testing Guide

## 🧪 How to Test the Extension

### Method 1: Extension Development Host (Recommended)

1. **Open the extension folder in VSCode**
   ```bash
   cd vscode-extension
   code .
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   # Or use watch mode for auto-rebuild:
   npm run watch
   ```

4. **Launch Extension Development Host**
   - Press `F5` in VSCode
   - Or click "Run and Debug" in the sidebar, then click the green play button
   - A new VSCode window will open with `[Extension Development Host]` in the title

5. **Open a test project**
   - In the Extension Development Host window, open a folder with code files
   - Example: Open `../examples/cursor-example/`

6. **Test the commands**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open Command Palette
   - Type "Project Index" to see available commands:
     - **Initialize Index System** - Creates all indexes
     - **Update All Indexes** - Refreshes all indexes
     - **Check Index Consistency** - Validates index integrity
     - **Toggle Auto Update** - Enable/disable auto-update

7. **Check the logs**
   - Open "Output" panel: View → Output
   - Select "ProjectIndex" from the dropdown
   - Watch for log messages as commands execute

8. **Test auto-update**
   - Make sure auto-update is enabled
   - Edit a code file (add a function, change an import, etc.)
   - Save the file
   - Check that the file header is updated
   - Check that FOLDER_INDEX.md is updated
   - Watch the logs in Output panel

### Method 2: Install .vsix Package

1. **Package the extension**
   ```bash
   npm run package
   # This creates: project-multilevel-index-0.1.0.vsix
   ```

2. **Install in VSCode**
   - Open VSCode
   - Go to Extensions view (Ctrl+Shift+X)
   - Click the "..." menu → "Install from VSIX..."
   - Select the .vsix file

3. **Reload VSCode**
   - Press `Ctrl+Shift+P` → "Reload Window"

4. **Test as in Method 1**

---

## ✅ Test Checklist

### Basic Functionality
- [ ] Extension activates when VSCode opens a workspace
- [ ] Welcome message shows on first activation
- [ ] All 4 commands appear in Command Palette
- [ ] Logger outputs to "ProjectIndex" channel

### Initialize Index Command
- [ ] Scans all code files in the project
- [ ] Creates file headers for all code files
- [ ] Creates FOLDER_INDEX.md in each folder
- [ ] Creates PROJECT_INDEX.md in workspace root
- [ ] Shows progress notification
- [ ] Shows success message when done
- [ ] Logs detailed progress to Output panel

### Auto-Update (File Watcher)
- [ ] Detects when a code file is saved
- [ ] Updates file header automatically
- [ ] Updates FOLDER_INDEX.md automatically
- [ ] Debounces rapid changes (300ms)
- [ ] Ignores excluded folders (node_modules, .git, etc.)
- [ ] Shows notification when index is updated

### Update All Indexes Command
- [ ] Updates all FOLDER_INDEX.md files
- [ ] Updates PROJECT_INDEX.md
- [ ] Shows progress notification
- [ ] Shows success message

### Check Index Consistency Command
- [ ] Detects missing PROJECT_INDEX.md
- [ ] Detects missing FOLDER_INDEX.md files
- [ ] Detects files without headers
- [ ] Shows issues in a warning message
- [ ] Offers to fix issues automatically

### Toggle Auto Update Command
- [ ] Toggles auto-update setting
- [ ] Shows confirmation message
- [ ] Persists setting across sessions

### Multi-Language Support
Test with different file types:
- [ ] TypeScript/JavaScript (.ts, .tsx, .js, .jsx)
- [ ] Python (.py)
- [ ] Java (.java)
- [ ] Rust (.rs)
- [ ] Go (.go)
- [ ] C/C++ (.c, .cpp, .h)
- [ ] PHP (.php)
- [ ] Ruby (.rb)
- [ ] Swift (.swift)
- [ ] C# (.cs)

### Edge Cases
- [ ] Empty project (no code files)
- [ ] Very large project (100+ files)
- [ ] File with existing header (should replace)
- [ ] File with shebang (should preserve)
- [ ] PHP file with <?php tag (should handle correctly)
- [ ] Nested folders (5+ levels deep)
- [ ] Files in excluded folders (should skip)

### Configuration
- [ ] Auto-update setting works
- [ ] Exclude patterns work
- [ ] Max depth setting works
- [ ] Max nodes in dependency graph works
- [ ] Notification settings work

---

## 🐛 Known Issues to Verify

1. **Welcome message persistence**
   - Issue: Shows every time (should only show once)
   - Test: Reload VSCode, check if message shows again

2. **Project index debouncing**
   - Issue: May update too frequently
   - Test: Edit multiple files rapidly, check if PROJECT_INDEX.md updates too often

3. **File deletion handling**
   - Issue: Not implemented yet
   - Test: Delete a file, check if indexes update

4. **Large project performance**
   - Issue: May be slow for 1000+ files
   - Test: Run on a large project, measure time

---

## 📊 Performance Benchmarks

| Project Size | Files | Init Time | Expected |
|-------------|-------|-----------|----------|
| Small | 10-20 | <1s | ✅ Pass |
| Medium | 50-100 | <5s | ✅ Pass |
| Large | 200-500 | <15s | ⚠️ Monitor |
| Very Large | 1000+ | <60s | ⚠️ May need optimization |

---

## 🔍 Debugging Tips

1. **Use the debugger**
   - Set breakpoints in the code
   - Press F5 to launch with debugger attached
   - Step through code execution

2. **Check the logs**
   - Always keep Output panel open
   - Set logger to debug level if needed
   - Look for error messages

3. **Inspect generated files**
   - Check file headers manually
   - Verify FOLDER_INDEX.md content
   - Verify PROJECT_INDEX.md content
   - Check Mermaid dependency graph syntax

4. **Use VSCode Developer Tools**
   - In Extension Development Host: Help → Toggle Developer Tools
   - Check Console for errors
   - Use Network tab if needed

---

## 🚀 Next Steps After Testing

1. **Fix any bugs found**
2. **Add unit tests**
3. **Add integration tests**
4. **Optimize performance**
5. **Test on Windows/Mac/Linux**
6. **Test in Cursor**
7. **Test in Windsurf**
8. **Test in Kiro (Code OSS)**
9. **Create demo video**
10. **Package and publish**

---

## 📝 Test Results Template

```markdown
# Test Session: YYYY-MM-DD

**Tester**: [Your Name]
**Platform**: Windows/Mac/Linux
**VSCode Version**: x.x.x
**Extension Version**: 0.1.0

## Results

### Basic Functionality
- [✅/❌] Extension activated
- [✅/❌] Commands registered
- [✅/❌] Logger working

### Initialize Index
- [✅/❌] File headers created
- [✅/❌] Folder indexes created
- [✅/❌] Project index created
- Issues: ...

### Auto-Update
- [✅/❌] File watcher working
- [✅/❌] Indexes updated on save
- Issues: ...

### Performance
- Project size: X files
- Init time: Y seconds
- Memory usage: Z MB

### Bugs Found
1. [Bug description]
2. [Bug description]

### Suggestions
1. [Improvement idea]
2. [Improvement idea]
```

---

**Happy Testing!** 🎉
