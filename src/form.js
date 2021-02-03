import express from 'express';
import { body, validationResult } from 'express-validator';

export const router = express.Router();

const ssnPattern = '^[0-9]{6}-?[0-9]{4}$';

const formInfo = {
  'name': '',
  'name_invalid': false,
  'ssn': '',
  'ssn_invalid': false,
};

router.get('/', (req, res, next) =>{
  res.render('form', { formInfo });
});

router.post('/post', 
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
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

    if(!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.send(
        `${template(name, ssn)}
        <p>Villur</p>
        <ul>
         <li>${errorMessages.join('</li><li>')}</li>
        </ul>`
      );
    }
    res.redirect('/motekid');
  }
);

router.get('/motekid', (req, res) => {
  res.send('takk fyrir mig');
});
