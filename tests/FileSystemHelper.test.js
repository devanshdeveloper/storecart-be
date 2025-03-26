const path = require("path");
const FileSystemHelper = require("../src/helpers/FileSystemHelper");

describe("FileSystemHelper", () => {
  const testDir = path.join(__dirname, "test-files");
  const testFile = path.join(testDir, "test.txt");
  const testNestedDir = path.join(testDir, "nested");
  const testNestedFile = path.join(testNestedDir, "nested.txt");

  //   beforeEach(async () => {
  //     // Clean up test directory before each test
  //     try {
  //       await FileSystemHelper.deleteDirectory(testDir);
  //     } catch (error) {
  //       // Ignore error if directory doesn't exist
  //     }
  //   });

  //   afterAll(async () => {
  //     // Clean up after all tests
  //     try {
  //       await FileSystemHelper.deleteDirectory(testDir);
  //     } catch (error) {
  //       // Ignore error if directory doesn't exist
  //     }
  //   });

  describe("File Operations", () => {
    // test("should create and read a file", async () => {
    //   const content = "Hello, World!";
    //   await FileSystemHelper.createFile(testFile, content);
    //   const readContent = await FileSystemHelper.readFile(testFile);
    //   expect(readContent).toBe(content);
    // });

        test('should update file content', async () => {
          const initialContent = 'Initial content';
          const updatedContent = 'Updated content';

          await FileSystemHelper.createFile(testFile, initialContent);
          await FileSystemHelper.updateFile(testFile, updatedContent);

          const readContent = await FileSystemHelper.readFile(testFile);
          expect(readContent).toBe(updatedContent);
        });

    //     test('should delete a file', async () => {
    //       await FileSystemHelper.createFile(testFile, 'Test content');
    //       await FileSystemHelper.deleteFile(testFile);

    //       await expect(FileSystemHelper.readFile(testFile))
    //         .rejects
    //         .toThrow('Error reading file');
    //     });

    //     test('should create nested file with directories', async () => {
    //       const content = 'Nested file content';
    //       await FileSystemHelper.createFile(testNestedFile, content);
    //       const readContent = await FileSystemHelper.readFile(testNestedFile);
    //       expect(readContent).toBe(content);
    //     });
    //   });

    //   describe('Directory Operations', () => {
    //     test('should create and read directory', async () => {
    //       await FileSystemHelper.createDirectory(testDir);
    //       await FileSystemHelper.createFile(testFile, 'Test content');

    //       const files = await FileSystemHelper.readDirectory(testDir);
    //       expect(files).toContain('test.txt');
    //     });

    //     test('should update directory name', async () => {
    //       const newTestDir = path.join(__dirname, 'test-files-renamed');

    //       await FileSystemHelper.createDirectory(testDir);
    //       await FileSystemHelper.createFile(testFile, 'Test content');
    //       await FileSystemHelper.updateDirectory(testDir, newTestDir);

    //       const files = await FileSystemHelper.readDirectory(newTestDir);
    //       expect(files).toContain('test.txt');

    //       // Clean up renamed directory
    //       await FileSystemHelper.deleteDirectory(newTestDir);
    //     });

    //     test('should delete directory with contents', async () => {
    //       await FileSystemHelper.createDirectory(testNestedDir);
    //       await FileSystemHelper.createFile(testNestedFile, 'Nested content');
    //       await FileSystemHelper.createFile(testFile, 'Test content');

    //       await FileSystemHelper.deleteDirectory(testDir);

    //       await expect(FileSystemHelper.readDirectory(testDir))
    //         .rejects
    //         .toThrow('Error reading directory');
    //     });
  });
});
