# Validation with Zod

This codebase uses [Zod](https://github.com/colinhacks/zod) for runtime type checking and validation of configuration objects.

## Benefits of Zod

- **Runtime Type Safety**: Validates data at runtime
- **Self-Documenting Schemas**: Schemas serve as documentation for data structures
- **Detailed Error Messages**: Provides meaningful error messages for validation failures
- **TypeScript Integration**: Automatic type inference from schemas
- **Composable Validation Logic**: Build complex validation rules from simple ones

## Available Schemas

The following Zod schemas are defined in `src/types/utils/validation-schema.ts` and exported from the main types module:

- `tokenConfigSchema`: For validating `TokenConfig` objects
- `vaultConfigSchema`: For validating `VaultConfig` objects
- `poolConfigSchema`: For validating `PoolConfig` objects
- `initialBuyConfigSchema`: For validating `InitialBuyConfig` objects
- `rewardsConfigSchema`: For validating `RewardsConfig` objects
- `deploymentConfigSchema`: For validating complete `DeploymentConfig` objects
- `simpleTokenConfigSchema`: For validating user-facing `SimpleTokenConfig` objects

## Validation Functions

The SDK provides two styles of validation functions:

### Boolean Validation (Legacy Style)

```typescript
import { isValidTokenConfig } from "clanker-sdk";

if (isValidTokenConfig(config)) {
  // Config is valid
  console.log("Token config is valid");
} else {
  // Config is invalid
  console.log("Token config is invalid");
}
```

### Detailed Validation with Error Information

```typescript
import { validateTokenConfig } from "clanker-sdk";

const result = validateTokenConfig(tokenConfig);

if (result.success) {
  // Use result.data (fully typed)
  const validData = result.data;
  console.log(`Valid token name: ${validData.name}`);
} else {
  // Handle errors with detailed information
  console.error("Validation errors:", result.error.format());
}
```

## Type Guards

You can also use Zod-based type guards to check if an object matches a specific type:

```typescript
import { isTokenConfig } from "clanker-sdk";

if (isTokenConfig(unknownObject)) {
  // TypeScript knows unknownObject is a TokenConfig here
  console.log(`Token name: ${unknownObject.name}`);
}
```

## Custom Validation

For more complex validation needs, you can extend the schemas:

```typescript
import { tokenConfigSchema } from "clanker-sdk";
import { z } from "zod";

// Add additional validation rules
const enhancedTokenSchema = tokenConfigSchema.extend({
  name: z.string().min(3).max(50)
}).refine(
  (data) => data.name !== data.symbol,
  { message: "Token name must be different from symbol" }
);
```

## Migration Notes

This validation system is designed to replace the previous validation functions in `src/types/utils/validation.ts`. The Zod-based approach provides more detailed error messages and better TypeScript integration. 