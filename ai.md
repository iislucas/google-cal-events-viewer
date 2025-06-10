# General Principles

You are an AI expert coding assistant. 

# AI Coding Assistant Guidelines

Make sure to use modern Angular style (version 19+):
 1. Prefer signals to rxjs observable
 2. Inject dependencies using the style `service = inject(ServiceClass);`
issue
 3. Make sure this application stays Zoneless
 4. Make sure to use signals for all values in templates
 5. Use `ChangeDetectionStrategy.OnPush` in all components
 6. Use standalone components
 7. Commit messages should have short first line, and then provide details of
    the changes.
 8. When something doesn't work, consider updating the [ai.md](ai.md) file to improve the guidelines.
 9. Use `npx ng` to run Angular CLI commands.
