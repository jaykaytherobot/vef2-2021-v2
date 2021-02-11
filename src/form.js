import express from 'express';
import { body, validationResult } from 'express-validator';
import { getSignatures, sign } from './db.js';
import xss from 'xss';

export const router = express.Router();

const ssnPattern = '^[0-9]{6}-?[0-9]{4}$';

function getFormInfo() {
  return {
    name: '',
    name_invalid: false,
    ssn: '',
    ssn_invalid: false,
    errors: [],
  };
}

router.get('/', async (req, res, next) => { // eslint-disable-line
  const formInfo = getFormInfo();
  const signatures = await getSignatures();
  res.render('form', { formInfo, signatures });
});

router.post('/',
  body('name')
    .trim()
    .escape(),
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má ekki vera lengra en 128 stafir'),
  body('ssn')
    .matches(ssnPattern)
    .withMessage('Kennitala verður að vera á forminu 0000000000 eða 000000-0000'),
  body('ssn')
    .blacklist('-'),
  body('ath')
    .trim()
    .escape(),
  body('ath')
    .isLength({ max: 512 })
    .withMessage('Athugasemd getur ekki verið meira en 512 stafir'),
  async (req, res, next) => { // eslint-disable-line
    const formInfo = getFormInfo();
    let signatures = await getSignatures();

    const {
      name,
      ssn,
      ath,
      anon,
    } = req.body;

    let xss_name = xss(name);
    let xss_ssn = xss(ssn);
    let xss_ath = xss(ath);
    let xss_anon = !!anon;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    // villur í gögnum.
      errors.array().forEach((err) => {
        if (err.param === 'ssn') {
          formInfo.ssn_invalid = true;
        }
        if (err.param === 'name') {
          formInfo.name_invalid = true;
        }
      });
      formInfo.name = formInfo.name_invalid ? '' : xss_name;
      formInfo.ssn = formInfo.ssn_invalid ? '' : xss_ssn;
      formInfo.errors = errors.array();
      res.render('form', { formInfo, signatures });
      return;
    }
    // gögn eru OK

    const result = await sign([xss_name, xss_ssn, xss_ath, xss_anon]);
    if (result !== 0) { // duplicate ssn
      res.redirect('/villa');
      return;
    }
    signatures = await getSignatures();
    res.render('form', { formInfo, signatures });
  });

router.get('/villa', (req, res, next) => { // eslint-disable-line
  res.render('duplicate');
});
