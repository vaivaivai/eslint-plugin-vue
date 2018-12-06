/**
 * @author Yosuke Ota
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const rule = require('../../../lib/rules/component-name-in-template-casing')
const RuleTester = require('eslint').RuleTester

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const tester = new RuleTester({
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
})

tester.run('component-name-in-template-casing', rule, {
  valid: [
    // default
    {
      code: `
        <template>
          <!-- ✓ GOOD -->
          <CoolComponent />
          <UnregisteredComponent />
          <unregistered-component />
        </template>
        <script>
        export default {
          components: {
            CoolComponent
          }
        }
        </script>
      `,
      filename: 'test.vue'
    },

    // element types test
    { code: '<template><div/></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><img></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><TheComponent/></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><svg><path/></svg></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><math><mspace/></math></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><div><slot></slot></div></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><h1>Title</h1></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><h1 :is="customTitle">Title</h1></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><svg><TheComponent /></svg></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><text /></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><circle cx="0" cy="0" :d="radius"></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },

    // kebab-case
    {
      code: '<template><the-component></the-component></template>',
      options: ['kebab-case', { registeredComponentsOnly: false }]
    },
    {
      code: '<template><div/></template>',
      options: ['kebab-case', { registeredComponentsOnly: false }]
    },
    {
      code: '<template><img></template>',
      options: ['kebab-case', { registeredComponentsOnly: false }]
    },
    {
      code: '<template><svg><path/></svg></template>',
      options: ['kebab-case', { registeredComponentsOnly: false }]
    },
    {
      code: '<template><math><mspace/></math></template>',
      options: ['kebab-case', { registeredComponentsOnly: false }]
    },

    // globalRegisteredComponents
    {
      code: `
        <template>
          <GlobalButton />
          <GlobalCard />
          <GlobalGrid />
        </template>
      `,
      filename: 'test.vue',
      options: ['PascalCase', { globalRegisteredComponents: ['GlobalButton', 'GlobalCard', 'GlobalGrid'] }]
    },

    // globalRegisteredComponentPatterns
    {
      code: `
        <template>
          <GlobalButton />
          <GlobalCard />
          <GlobalGrid />
        </template>
      `,
      filename: 'test.vue',
      options: ['PascalCase', { globalRegisteredComponentPatterns: ['^Global'] }]
    },

    // ignores
    {
      code: '<template><custom-element></custom-element></template>',
      options: ['PascalCase', { ignores: ['custom-element'], registeredComponentsOnly: false }]
    },
    {
      code: '<template><custom-element><TheComponent/></custom-element></template>',
      options: ['PascalCase', { ignores: ['custom-element'], registeredComponentsOnly: false }]
    },
    // Invalid EOF
    { code: '<template><the-component a=">test</the-component></template>', options: ['PascalCase', { registeredComponentsOnly: false }] },
    { code: '<template><the-component><!--test</the-component></template>', options: ['PascalCase', { registeredComponentsOnly: false }] }
  ],
  invalid: [
    {
      code: `
        <template>
          <!-- ✗ BAD -->
          <cool-component />
          <coolComponent />
          <Cool-component />
        </template>
        <script>
        export default {
          components: {
            CoolComponent
          }
        }
        </script>
      `,
      filename: 'test.vue',
      output: `
        <template>
          <!-- ✗ BAD -->
          <CoolComponent />
          <CoolComponent />
          <CoolComponent />
        </template>
        <script>
        export default {
          components: {
            CoolComponent
          }
        }
        </script>
      `,
      errors: [
        {
          message: 'Component name "cool-component" is not PascalCase.',
          line: 4,
          column: 11,
          endLine: 4,
          endColumn: 26
        },
        {
          message: 'Component name "coolComponent" is not PascalCase.',
          line: 5,
          column: 11,
          endLine: 5,
          endColumn: 25
        },
        {
          message: 'Component name "Cool-component" is not PascalCase.',
          line: 6,
          column: 11,
          endLine: 6,
          endColumn: 26
        }
      ]
    },
    {
      code: `
        <template>
          <!-- ✗ BAD -->
          <CoolComponent />
          <coolComponent />
          <Cool-component />
        </template>
        <script>
        export default {
          components: {
            CoolComponent
          }
        }
        </script>
      `,
      filename: 'test.vue',
      options: ['kebab-case'],
      output: `
        <template>
          <!-- ✗ BAD -->
          <cool-component />
          <cool-component />
          <cool-component />
        </template>
        <script>
        export default {
          components: {
            CoolComponent
          }
        }
        </script>
      `,
      errors: [
        {
          message: 'Component name "CoolComponent" is not kebab-case.',
          line: 4
        },
        {
          message: 'Component name "coolComponent" is not kebab-case.',
          line: 5
        },
        {
          message: 'Component name "Cool-component" is not kebab-case.',
          line: 6
        }
      ]
    },
    {
      code: `
      <template>
        <svg>
          <the-component />
        </svg>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <svg>
          <TheComponent />
        </svg>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component id="id">
          <!-- comment -->
        </the-component>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent id="id">
          <!-- comment -->
        </TheComponent>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component :is="componentName">
          content
        </the-component>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent :is="componentName">
          content
        </TheComponent>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component id="id"/>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent id="id"/>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <TheComponent id="id">
          <!-- comment -->
        </TheComponent>
      </template>
      <script>
      export default {
        components: {TheComponent}
      }
      </script>
      `,
      filename: 'test.vue',
      options: ['kebab-case'],
      output: `
      <template>
        <the-component id="id">
          <!-- comment -->
        </the-component>
      </template>
      <script>
      export default {
        components: {TheComponent}
      }
      </script>
      `,
      errors: ['Component name "TheComponent" is not kebab-case.']
    },
    {
      code: `
      <template>
        <TheComponent id="id"/>
      </template>
      `,
      options: ['kebab-case', { registeredComponentsOnly: false }],
      output: `
      <template>
        <the-component id="id"/>
      </template>
      `,
      errors: ['Component name "TheComponent" is not kebab-case.']
    },
    {
      code: `
      <template>
        <the-component
          id="id"/>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent
          id="id"/>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component/>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent/>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component></the-component>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent></TheComponent>
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <theComponent/>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent/>
      </template>
      `,
      errors: ['Component name "theComponent" is not PascalCase.']
    },
    {
      code: `
      <template>
        <theComponent/>
      </template>
      `,
      options: ['kebab-case', { globalRegisteredComponents: ['TheComponent'] }],
      output: `
      <template>
        <the-component/>
      </template>
      `,
      errors: ['Component name "theComponent" is not kebab-case.']
    },
    {
      code: `
      <template>
        <The-component/>
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent/>
      </template>
      `,
      errors: ['Component name "The-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <The-component/>
      </template>
      `,
      options: ['kebab-case', { globalRegisteredComponentPatterns: ['Component$'] }],
      output: `
      <template>
        <the-component/>
      </template>
      `,
      errors: ['Component name "The-component" is not kebab-case.']
    },
    {
      code: `
      <template>
        <Thecomponent/>
      </template>
      `,
      options: ['kebab-case', { registeredComponentsOnly: false }],
      output: `
      <template>
        <thecomponent/>
      </template>
      `,
      errors: ['Component name "Thecomponent" is not kebab-case.']
    },
    {
      code: `
      <template>
        <the-component></the-component  >
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent></TheComponent  >
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component></the-component
        >
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent></TheComponent
        >
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },
    {
      code: `
      <template>
        <the-component></the-component end-tag-attr="attr" >
      </template>
      `,
      options: ['PascalCase', {
        globalRegisteredComponents: ['TheComponent']
      }],
      output: `
      <template>
        <TheComponent></TheComponent end-tag-attr="attr" >
      </template>
      `,
      errors: ['Component name "the-component" is not PascalCase.']
    },

    // globalRegisteredComponents
    {
      code: `
        <template>
          <global-button />
          <global-card />
          <global-grid />
        </template>
      `,
      filename: 'test.vue',
      options: ['PascalCase', { globalRegisteredComponents: ['GlobalButton', 'GlobalCard', 'GlobalGrid'] }],
      output: `
        <template>
          <GlobalButton />
          <GlobalCard />
          <GlobalGrid />
        </template>
      `,
      errors: [
        'Component name "global-button" is not PascalCase.',
        'Component name "global-card" is not PascalCase.',
        'Component name "global-grid" is not PascalCase.'
      ]
    },

    // globalRegisteredComponentPatterns
    {
      code: `
        <template>
          <global-button />
          <global-card />
          <global-grid />
        </template>
      `,
      filename: 'test.vue',
      options: ['PascalCase', { globalRegisteredComponentPatterns: ['^Global'] }],
      output: `
        <template>
          <GlobalButton />
          <GlobalCard />
          <GlobalGrid />
        </template>
      `,
      errors: [
        'Component name "global-button" is not PascalCase.',
        'Component name "global-card" is not PascalCase.',
        'Component name "global-grid" is not PascalCase.'
      ]
    },

    // ignores
    {
      code: `
      <template>
        <custom-element>
          <the-component />
        </custom-element>
        <custom-component />
      </template>`,
      output: `
      <template>
        <custom-element>
          <TheComponent />
        </custom-element>
        <CustomComponent />
      </template>`,
      options: ['PascalCase', {
        ignores: ['custom-element'],
        globalRegisteredComponentPatterns: ['^the', '^custom']
      }],
      errors: [
        'Component name "the-component" is not PascalCase.',
        'Component name "custom-component" is not PascalCase.'
      ]
    },
    {
      code: `
      <template>
        <custom-element1>
          <the-component />
        </custom-element1>
        <custom-element2 />
        <the-component />
      </template>`,
      output: `
      <template>
        <custom-element1>
          <TheComponent />
        </custom-element1>
        <custom-element2 />
        <TheComponent />
      </template>`,
      options: ['PascalCase', {
        ignores: ['custom-element1', 'custom-element2'],
        globalRegisteredComponentPatterns: ['^the', '^custom']
      }],
      errors: [
        'Component name "the-component" is not PascalCase.',
        'Component name "the-component" is not PascalCase.'
      ]
    },
    {
      code: `
      <template>
        <custom-element1>
          <the-component />
        </custom-element1>
        <custom-element2 />
        <the-component />
      </template>`,
      output: `
      <template>
        <custom-element1>
          <TheComponent />
        </custom-element1>
        <custom-element2 />
        <TheComponent />
      </template>`,
      options: ['PascalCase', {
        ignores: ['custom-element1', 'custom-element2'],
        registeredComponentsOnly: false
      }],
      errors: [
        'Component name "the-component" is not PascalCase.',
        'Component name "the-component" is not PascalCase.'
      ]
    }
  ]
})
