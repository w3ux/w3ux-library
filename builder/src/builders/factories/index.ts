import { simpleBuild } from 'builders/common/simpleBuild'

export const build = async () => {
  await simpleBuild('factories', { bundler: 'gulp' })
}
