/**
 * This is an example unit test that you will need to modify to actually test your QCP files
 *
 * To get started:
 *  - Ensure you have a valid QCP file in the SRC directory that works
 *  - Ensure you have node installed
 *  - Run `npm install` from the root directory to install dependencies
 *  - Run the command: "SFDC QCP: Fetch record data from Salesforce and save locally"
 *    - Enter a valid QuoteId
 *    - Choose a valid filename for the output (defaults to quoteId)
 *  - Uncomment the code below
 *  - Replace the file path for the quoteModel that you saved in the previous step
 *  - Replace the file path to your QCP file if it differs from the example
 *  - If JSForce is required, then you will need to include your credentials in the `.env` file
 *  - update the unit tests as needed
 *  - run `npm run test` from the command line to run your tests. Optionally, create a VSCode configuration to run the tests.
 */

// import { expect } from 'chai';
// import * as quoteModel from '../data/a1j50000006gHK7AAM.json';
// import * as qcp from '../src/QCP';
// import { getConn } from './init-jsforce.js';

// /**
//  * If you need to use the JSForce conn object, uncomment the following line
//  * Ensure that you update .env with your credentials
//  */
// // const conn = getConn();

// describe('QCP Test', () => {
//   // TODO: Update any unit tests as needed and remove/comment tests for hooks that are not implemented

//   it('Should successfully call onInit()', async () => {
//     await qcp.onInit(quoteModel.lineItems);
//     expect(true).to.equal(true);
//   });

//   it('Should successfully call onBeforeCalculate()', async () => {
//     await qcp.onBeforeCalculate(quoteModel, quoteModel.lineItems, undefined);
//     expect(true).to.equal(true);
//   });

//   it('Should successfully call onBeforePriceRules()', async () => {
//     await qcp.onBeforePriceRules(quoteModel, quoteModel.lineItems, undefined);
//     expect(true).to.equal(true);
//   });

//   it('Should successfully call onAfterPriceRules()', async () => {
//     await qcp.onAfterPriceRules(quoteModel, quoteModel.lineItems, undefined);
//     expect(true).to.equal(true);
//   });

//   it('Should successfully call onAfterCalculate()', async () => {
//     await qcp.onAfterCalculate(quoteModel, quoteModel.lineItems, undefined);
//     expect(true).to.equal(true);
//   });
// });
