import { simpleBuild } from 'builders/common/simpleBuild'

export const build = async () => {
  await simpleBuild('utils', { bundler: 'tsup' })
}
