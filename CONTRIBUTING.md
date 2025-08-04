# Contributing to CogniChat

First off, thank you for considering contributing to CogniChat! 🎉

The following is a set of guidelines for contributing to CogniChat. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Additional Notes](#additional-notes)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this standard.

### Our Standards

- **Be respectful** and inclusive in your communication
- **Be collaborative** and open to feedback
- **Focus on the issue**, not the person
- **Help others learn** and grow

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check if the issue already exists in the [GitHub Issues](https://github.com/Yatharth-Vrma/CogniChat/issues).

When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and explain what behavior you expected
- **Include screenshots** if applicable
- **Include your environment details** (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issue labels:

- `good-first-issue` - Issues that are good for newcomers
- `help-wanted` - Issues that need extra attention
- `documentation` - Improvements to documentation

### Pull Requests

- Fill in the required template
- Include screenshots and animated GIFs when appropriate
- Follow the JavaScript and React style guides
- Include tests when adding new features
- Document new code based on the Documentation Style Guide
- End all files with a newline

## Development Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- Git
- Supabase account (for testing)
- Google AI Studio account (for AI features)

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/CogniChat.git
   cd CogniChat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update the CHANGELOG.md** with your changes
3. **Ensure all tests pass** and the build succeeds
4. **Request review** from maintainers
5. **Address feedback** and make necessary changes
6. **Merge** will be done by maintainers after approval

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## Style Guides

### JavaScript Style Guide

- Use **ES6+** features where appropriate
- Use **const** and **let** instead of **var**
- Use **arrow functions** for anonymous functions
- Use **template literals** instead of string concatenation
- **Destructure** objects and arrays when possible
- Use **async/await** instead of promises where readable

#### Example:
```javascript
// Good
const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Bad
function getUserData(userId) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .then(function(result) {
      return result.data;
    });
}
```

### React Style Guide

- Use **functional components** with hooks
- Use **PascalCase** for component names
- Use **camelCase** for prop names
- Extract **custom hooks** for reusable logic
- Use **PropTypes** or TypeScript for type checking

#### Example:
```javascript
// Good
const ChatMessage = ({ message, sender, timestamp }) => {
  const isUser = sender === 'user';
  
  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <p>{message}</p>
      <span className="timestamp">{timestamp}</span>
    </div>
  );
};

// Bad
function ChatMessage(props) {
  return (
    <div className={props.sender === 'user' ? 'user-message' : 'ai-message'}>
      <p>{props.message}</p>
    </div>
  );
}
```

### CSS Style Guide

- Use **Tailwind CSS** utility classes when possible
- Use **CSS modules** or **styled-components** for custom styles
- Follow **BEM methodology** for CSS class names
- Use **semantic HTML** elements
- Ensure **accessibility** compliance

### Git Commit Messages

Use the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

#### Examples:
```
feat: add voice input functionality
fix: resolve chat persistence issue
docs: update API documentation
style: format code with prettier
refactor: extract chat logic into custom hook
test: add unit tests for aiService
chore: update dependencies
```

## Additional Notes

### Issue and Pull Request Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention is needed
- `documentation` - Improvements or additions to documentation
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right
- `question` - Further information is requested
- `wontfix` - This will not be worked on

### Community

- Be welcoming to newcomers
- Help others learn and grow
- Share knowledge and best practices
- Celebrate contributions, big and small

### Getting Help

If you need help:
- Check the documentation
- Search existing issues
- Ask questions in GitHub Discussions
- Reach out to maintainers

Thank you for contributing to CogniChat! 🚀
