declare var describe, test, expect, require, process;

import mail from '../mail';

test('sendMail method', ()=>{

    mail.send({
        to: process.env.ADMIN_EMAIL,
        toName: process.env.ADMIN_NAME,
        subject: 'Test',
        body: 'Hello world'
    })
});
