import express from 'express';
import { getSignatures as getSignatures, sign as sign} from './db.js'
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

router.get('/', async (req, res, next) =>{
  const formInfo = getFormInfo();
  const signatures = await getSignatures();
  res.render('form', { formInfo, signatures });
});

router.post('/', async (req, res, next) => {
  const {
    name,
    ssn,
    ath,
    anon
  } = req.body;
  await sign([name, ssn, ath, !anon]);

  const formInfo = getFormInfo();
  const signatures = await getSignatures();
  res.render('form', { formInfo, signatures });
});

