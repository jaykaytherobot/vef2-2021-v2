import express from 'express';
import { body, validationResult } from 'express-validator';

export const router = express.Router();

const ssnPattern = '^[0-9]{6}-?[0-9]{4}$';

function getFormInfo() {
  return {
  'name': '',
  'name_invalid': false,
  'ssn': '',
  'ssn_invalid': false,
  'errors': []
  }
}

router.get('/', (req, res, next) =>{
  const formInfo = getFormInfo();
  res.render('form', { formInfo });
});

router.post('/', 
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má mest vera 128 stafir'),
  body('ssn')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('ssn')
    .matches(new RegExp(ssnPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  (req, res, next) => {
    const {
      name = '',
      ssn = '',
      birta = '',
      athugasemdir = ''
    } = req.body;

    const errors = validationResult(req);
    const formInfo = getFormInfo();

    if(!errors.isEmpty()) {
      errors.array().forEach((err) => {
        err.param === 'ssn' ? formInfo.ssn_invalid = true : '';
        err.param === 'name' ? formInfo.name_invalid = true : '';
      });
      formInfo.name = name;
      formInfo.ssn = ssn;
      formInfo.errors = errors.array();
      console.log(errors.array());
      return res.render('form', { formInfo });
    }
    res.redirect('/motekid');
  }
);

router.get('/motekid', (req, res) => {
  res.send('takk fyrir mig');
});
