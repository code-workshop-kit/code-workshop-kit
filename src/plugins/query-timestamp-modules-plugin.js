import { transformSync } from '@babel/core';
import path from 'path';
import { cwkState } from '../utils/CwkStateSingleton.js';

export function queryTimestampModulesPlugin(dir) {
  return {
    transform(context) {
      let rewrittenBody = context.body;

      if (
        context.status === 200 &&
        context.response.is('js') &&
        cwkState.state.queryTimestamps &&
        context.cookies.get('participant_name')
      ) {
        // Get participant name from browser path
        const normalizedPath = context.path.endsWith('/')
          ? `${context.path}index.html`
          : context.path;
        const participantName = path.basename(path.dirname(decodeURI(normalizedPath)));
        const timestamp = cwkState.state.queryTimestamps[participantName];

        if (timestamp) {
          try {
            rewrittenBody = transformSync(rewrittenBody, {
              plugins: [
                [
                  ({ types: t }) => ({
                    visitor: {
                      ImportDeclaration(astPath, state) {
                        if (
                          astPath.node.source.value.startsWith('.') ||
                          astPath.node.source.value.startsWith('/')
                        ) {
                          const participantFolderRelativeToServer = `${dir}/participants`.split(
                            process.cwd(),
                          )[1];

                          const importAbsoluteToServer = path.resolve(
                            state.opts.url,
                            '../',
                            astPath.node.source.value,
                          );

                          if (
                            importAbsoluteToServer.startsWith(participantFolderRelativeToServer)
                          ) {
                            // eslint-disable-next-line no-param-reassign
                            astPath.node.source = t.stringLiteral(
                              `${astPath.node.source.value}?mtime=${timestamp}`,
                            );
                          }
                        }
                      },
                    },
                  }),
                  { url: decodeURI(context.url) },
                ],
              ],
            }).code;
          } catch (e) {
            // WDS will already throw this error to the browser because it also tries to do babel parsing on it
          }
        }
      }

      return { body: rewrittenBody, transformCache: false };
    },
  };
}
