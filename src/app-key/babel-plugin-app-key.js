const createProperty = ({ types: t, key }) => {
  return t.objectProperty(t.identifier('appKey'), t.stringLiteral(key));
};

const propertyVistior = {
  Property(path) {
    if (path.node === this.appKey) {
      path.replaceWith(createProperty({ types: this.types, key: this.key }));
    }
  },
};

module.exports = ({ types: t }) => ({
  visitor: {
    ExportDefaultDeclaration(path, state) {
      if (path.node.declaration) {
        const existingAppKeyPropIndex = path.node.declaration.properties.findIndex(
          prop => prop.key.name === 'appKey',
        );

        let existingAppKey;
        if (existingAppKeyPropIndex !== -1) {
          if (state.opts.clear) {
            path.node.declaration.properties.splice(existingAppKeyPropIndex, 1);
          } else {
            existingAppKey = path.node.declaration.properties[existingAppKeyPropIndex];
            path.traverse(propertyVistior, {
              appKey: existingAppKey,
              types: t,
              key: state.opts.key,
            });
          }
        } else {
          path.node.declaration.properties.unshift(
            createProperty({ types: t, key: state.opts.key }),
          );
        }
      }
    },
  },
});
