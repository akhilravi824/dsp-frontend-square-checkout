// Load environment variables from .env file
require('dotenv').config();

const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

/**
 * Script to extract Sanity schema types for TypeScript
 */
async function generateSanityTypes() {
  // Configure Sanity client
  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'your-project-id',
    dataset: process.env.SANITY_ENV || 'production',
    apiVersion: '2023-09-25', // Use a current date in YYYY-MM-DD format
    useCdn: false
  });

  console.log('Using Sanity project ID:', process.env.SANITY_PROJECT_ID || '(not set)');
  console.log('Using Sanity dataset:', process.env.SANITY_DATASET || '(not set)');

  try {
    // Fetch all document types
    const types = await client.fetch(`
      *[_type == "schema.type"] {
        name,
        title,
        fields[] {
          name,
          type,
          title,
          description,
          options
        }
      }
    `);

    // Generate TypeScript interfaces
    let typesString = `// Generated Sanity types - DO NOT EDIT MANUALLY\n\n`;

    types.forEach((type) => {
      typesString += `export interface ${type.name.charAt(0).toUpperCase() + type.name.slice(1)} {\n`;
      typesString += `  _id: string;\n`;
      typesString += `  _type: '${type.name}';\n`;
      typesString += `  _createdAt: string;\n`;
      typesString += `  _updatedAt: string;\n`;

      type.fields.forEach((field) => {
        const fieldType = mapSanityTypeToTS(field.type);
        typesString += `  ${field.name}: ${fieldType};\n`;
      });

      typesString += `}\n\n`;
    });

    // Write to file
    const outputDir = path.join(process.cwd(), 'src', 'lib');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(path.join(outputDir, 'sanity-types.ts'), typesString);
    console.log('Sanity types generated successfully!');
  } catch (error) {
    console.error('Failed to generate Sanity types:', error);
  }
}

/**
 * Maps Sanity field types to TypeScript types
 */
function mapSanityTypeToTS(fieldType) {
  switch (fieldType) {
    case 'string':
      return 'string';
    case 'text':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'datetime':
      return 'string';
    case 'date':
      return 'string';
    case 'array':
      return 'any[]';
    case 'image':
      return '{ asset: { _ref: string }, alt?: string }';
    case 'reference':
      return '{ _ref: string }';
    case 'object':
      return 'Record<string, any>';
    case 'slug':
      return '{ current: string }';
    case 'block':
      return 'any[]'; // For rich text content
    default:
      return 'any';
  }
}

// Run the function
generateSanityTypes();
