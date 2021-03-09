import * as BabelTypes from '@babel/types';
import { NodePath, Visitor } from '@babel/traverse';

interface PluginOptions {
  opts?: {
    clear?: boolean;
    key?: string;
  };
  file?: {
    path?: NodePath;
  };
}

const createProperty = ({ types: t, key }: { types: typeof BabelTypes; key: string }) =>
  t.objectProperty(t.identifier('appKey'), t.stringLiteral(key));

const propertyVistior: Visitor<{
  appKey: BabelTypes.ObjectProperty;
  types: typeof BabelTypes;
  key: string | undefined;
}> = {
  ObjectProperty(path: NodePath<BabelTypes.ObjectProperty>) {
    if (path.node === this.appKey && this.key) {
      path.replaceWith(createProperty({ types: this.types, key: this.key }));
    }
  },
};

export default ({
  types: t,
}: {
  types: typeof BabelTypes;
}): {
  visitor: {
    ExportDefaultDeclaration(
      path: NodePath<BabelTypes.ExportDefaultDeclaration>,
      state: PluginOptions,
    ): void;
  };
} => ({
  visitor: {
    ExportDefaultDeclaration(
      path: NodePath<BabelTypes.ExportDefaultDeclaration>,
      state: PluginOptions,
    ) {
      if (path.node.declaration && path.node.declaration.type === 'ObjectExpression') {
        const existingAppKeyPropIndex = path.node.declaration.properties.findIndex(
          (prop) =>
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'appKey',
        );

        let existingAppKey: BabelTypes.ObjectProperty;
        if (existingAppKeyPropIndex !== -1) {
          if (state.opts?.clear) {
            path.node.declaration.properties.splice(existingAppKeyPropIndex, 1);
          } else {
            existingAppKey = path.node.declaration.properties[
              existingAppKeyPropIndex
            ] as BabelTypes.ObjectProperty;
            path.traverse(propertyVistior, {
              appKey: existingAppKey,
              types: t,
              key: state.opts?.key,
            });
          }
        } else if (state.opts?.key) {
          path.node.declaration.properties.unshift(
            createProperty({ types: t, key: state.opts?.key }),
          );
        }
      }
    },
  },
});
