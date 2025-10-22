import { fetchData } from '../sanityClient';
import { createDraftFilter, includeDrafts, ENVIRONMENT } from '../environment';

export async function fetchPage() {
  try {
    console.log(`Fetching signupPage in ${ENVIRONMENT} environment`);

    // Get the appropriate draft filter based on environment
    const draftFilter = createDraftFilter();
    const query = signupPageQuery;
    const pageData = await fetchData(query, {});

    // In dev/staging, we prioritize draft content over published
    if (includeDrafts && Array.isArray(pageData) && pageData.length > 0) {
      // Find a draft document first, fallback to any document
      const draftPage = pageData.find((doc) => doc._id?.startsWith('drafts.'));
      return draftPage ? [draftPage] : pageData;
    }

    return pageData;
  } catch (error) {
    console.error(`Error fetching signupPage":`, error);
    return [];
  }
}

/**
 * Get signup page with all components and their specific fields
 */
export const signupPageQuery = `
  *[_type == "signupPage"] {
    _id,
    title,
    "slug": slug.current,
    formEntryPoint-> {
       // Fields specific to signup questions
       _id,
      composition,
      title,
      name,
      "answers": answers[] {
        title,
        "icon": icon-> {
          "id": id,
          "title": title
        },
        id,
        isUniversity,
        isVisible,
        // If there's a nested question, resolve it
        "signupQuestion": signupQuestion->{
          _id,
          title,
          name,
          composition,
          "answers": answers[]{
            _key,
            title,
            "icon": icon-> {
              "id": id,
              "title": title
            },
            id,
            isUniversity,
            // Add third level nesting for unit questions
            "signupQuestion": signupQuestion->{
              _id,
              title,
              name,
              composition,
              "answers": answers[]{
                _key,
                title,
                "icon": icon-> {
                  "id": id,
                  "title": title
                },
                id,
                isUniversity
              }
            }
          }
        }
      }
    },
    signupFormCopy-> {
      // Fields specific to the signup form
      title,
      consent,
      "agreement": agreement[] {
        ...,
      }
    },
    signupVerifyCopy-> {
       // Fields specific to signup verification
      title
    },
    "components": components[]-> {
      _id,
      _type,
      // Common fields across all components
      title,
      
      // Type-specific fields using conditional selection
      ...select(
        _type == "signupVerify" => {
          // Fields specific to signup verification
          instructions,
          verificationMethod
        },
        
        _type == "signupQuestion" => {
          // Fields specific to signup questions
          composition,
          "answers": answers[] {
            title,
            "icon": icon-> {
              "id": id,
              "title": title
            },
            id,
            isUniversity,
            isVisible,
            // If there's a nested question, resolve it
            "nextQuestion": signupQuestion->{
              _id,
              title,
              composition,
              "answers": answers[]{
                _key,
                title,
                "icon": icon-> {
                  "id": id,
                  "title": title
                },
                id,
                isUniversity,
                // Add third level nesting for unit questions
                "signupQuestion": signupQuestion->{
                  _id,
                  title,
                  name,
                  composition,
                  "answers": answers[]{
                    _key,
                    title,
                    "icon": icon-> {
                      "id": id,
                      "title": title
                    },
                    id,
                    isUniversity
                  }
                }
              }
            }
          }
        },
        
        _type == "signupPlans" => {
          // Fields specific to signup plans
          "plans": plans[]-> {
            _id,
            title,
            variationId,
            label,
            copy,
            price,
            "details": details[] {
              ...,
            },
            perks
          }
        },
        
        _type == "signupLogin" => {
          // Fields specific to login component
          instructions,
          loginOptions
        },
        
        _type == "signupForm" => {
          // Fields specific to the signup form
          title,
          consent,
          "agreement": agreement[] {
            ...,
          }
        },
        
        // Default case if none match
        {}
      )
    }
  }
`;




