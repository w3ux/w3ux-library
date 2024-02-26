## Adding A Validator Operator

To add an operator, submit a PR with the following changes:

- **Icon:** Add an operator icon in the `src` folder.
- **Details:** Add your operator details to the `ValidatorCommunity` list in `src/index.ts`.

### Structure

The following table outlines the structure of a `ValidatorCommunity` entry:

| Element        | Key          | Required | Notes                                                                                       | Example                                                 |
| -------------- | ------------ | -------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Operator Name  | `name`       | Yes      | The chosen name of the operator.                                                            | `Operator`                                              |
| Icon Filename  | `icon`       | Yes      | The name of your SVG component file.                                                        | _See Below_                                             |
| Bio            | `bio`        | No       | A short description of your entity. Maximum 300 characters.                                 | `Summing up my validator identity in a sentence or so.` |
| Email Address  | `email`      | No       | A public email address representing the operator.                                           | `operator@polkadot.network`                             |
| X Handle       | `x`          | No       | The X handle representing the operator.                                                     | `@polkadot`                                             |
| Website URL    | `website`    | No       | A live and vlid secure URL to your website.                                                 | `https://polkadot.network`                              |
| Validator List | `validators` | Yes      | A list of validators grouped by network. At least 1 validator in 1 network must be defined. | _See Below_                                             |


### Guidelines 

| |                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| __Icon__        | Upload your SVG icon as a JSX component. Look at the existing icons for examples, or use the [SVGR Playground](https://react-svgr.com/playground/) to convert your raw SVG file into a component.                                                                                                                                               |
| __Accuracy__    | Operator contact details must be working and valid.                                                                                                                                               |
| __Liveness__    | All submitted validator addresses must be discoverable as a validator on the network in question - whether Polkadot or Kusama.                                                                    |
| __Ordering__    | Please place your operator in alphabetical order within `ValidatorCommunity`. |

### Questions 

Please submit an issue for any queries around adding your operator details and we'll be happy to help.
