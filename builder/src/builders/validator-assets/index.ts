import { simpleBuild } from 'builders/common/simpleBuild'

export const build = async () => {
  await simpleBuild('validator-assets', { bundler: null })
}
