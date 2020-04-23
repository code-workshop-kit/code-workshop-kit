/* eslint-disable no-param-reassign */
export default ({ types: t }) => ({
  visitor: {
    /**
     * Finds import declarations and resolves the workshop.js file to the appIndex parent folder
     */
    ImportDeclaration(path, state) {
      path.node.specifiers.forEach(specifier => {
        if (specifier.imported.name === 'workshop') {
          path.node.source = t.stringLiteral(`${state.opts.rootPath}workshop.js`);
        }
      });
    },
  },
});
