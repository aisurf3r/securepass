![{04027814-D10C-4C92-B7D4-7B0AD97ACF89}](https://github.com/user-attachments/assets/85d9529d-54cc-49e1-bcb3-600384ebf0e8)


SECUREPASS - Secure Password Generator

SecurePass is an advanced password generator that uses entropy collected from mouse movements (or touch interactions on mobile devices) to create secure and unique passwords. The application focuses on security, usability, and privacy, ensuring that your passwords are robust and tailored to your preferences.

KEY FEATURES

1. Entropy-Based Password Generation
Collects entropy through mouse movements or touch gestures.
Generates cryptographically secure passwords using crypto.getRandomValues() for true randomness.

2. Password Customization
Adjust password length (between 8 and 32 characters).
Include or exclude uppercase letters, lowercase letters, numbers, and symbols.
Real-time strength calculation ensures your password meets security standards.

3. Password Strength Analysis
Evaluates password strength based on:
-Length
-Character variety (uppercase, lowercase, numbers, symbols)
-Character distribution
-Penalties for repeating characters and sequential patterns
-Displays strength as a percentage and categorizes it into Weak, Fair, Good, or Strong.

4. Password History
Saves up to 10 recently generated passwords with timestamps and strength scores.
Accessible via a history modal for quick reference.

5. Keyboard Shortcuts
Streamline workflows with keyboard shortcuts:
SHIFT+C : Copy password to clipboard.
SHIFT+D : Download password as a text file.
SHIFT+R : Reset the generator.
SHIFT+H : Toggle password history.
SHIFT+K : Show keyboard shortcuts.

6. Mobile-Friendly Design
Optimized for both desktop and mobile devices.
Touch-based entropy collection ensures seamless functionality on smartphones and tablets.

7. Privacy and Security
All password generation happens locally in your browser—no data is sent to external servers.
Built with security best practices to ensure your passwords remain private.

HOW TO USE

Set Your Preferences : Adjust the password length using the slider.
Select the character types you want to include (uppercase, lowercase, numbers, symbols).
Collect Entropy : Move your mouse outside the generator box (or swipe on mobile) to collect entropy.
A progress bar will indicate how much entropy has been collected (up to 100%).
Generate Password : Once sufficient entropy is collected, a secure password will be generated.
The password strength will be displayed as a percentage and categorized (Weak, Fair, Good, Strong).
Copy or Download : Click the copy icon to copy the password to your clipboard.
Click the download icon to save the password as a .txt file.
Access History : View previously generated passwords by clicking the history button or using the keyboard shortcut Ctrl+H .
Reset and Regenerate : Click the "Generate New Password" button or use the keyboard shortcut Ctrl+R to reset the generator and start over.

INSTALLATION 

To run this project locally:

Clone the repository: git clone https://github.com/aisurf3r/securepass.git

Navigate to the project directory: cd securepass

Install dependencies: npm install

Start the development server: npm start

The application will be available at http://localhost:5173

Render the project for server deploy: npm run build

TECHNOLOGIES USED

React : For building the user interface.

TypeScript : For type safety and enhanced developer experience.

Lucide React Icons : For clean and modern icons.

CSS Flexbox/Grid : For responsive and visually appealing layouts.

Web Crypto API : For generating cryptographically secure random values.

Contributing & Support
Contributions are welcome! If you encounter any issues or have suggestions for improvement, please open an issue in the GitHub repository.


 Built with ❤️ by [aisurf3r]
© 2025 SecurePass. This project is licensed under the MIT License. 
