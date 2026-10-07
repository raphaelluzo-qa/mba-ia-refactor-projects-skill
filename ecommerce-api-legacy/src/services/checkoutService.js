class CheckoutService {
  constructor(db, CourseRepository) { this.db = db; this.courses = new CourseRepository(db); }
  checkout(input, callback) {
    const { name, email, password, courseId, card } = input;
    if (!name || !email || !courseId || !card) return callback({ status: 400, message: 'Bad Request' });
    this.courses.findActive(courseId, (err, course) => {
      if (err || !course) return callback({ status: 404, message: 'Curso não encontrado' });
      this.db.get('SELECT id FROM users WHERE email = ?', [email], (userErr, user) => {
        if (userErr) return callback({ status: 500, message: 'Erro DB' });
        const finish = (userId) => {
          const status = card.startsWith('4') ? 'PAID' : 'DENIED';
          if (status === 'DENIED') return callback({ status: 400, message: 'Pagamento recusado' });
          const db = this.db;
          db.run('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId], function (enrollErr) {
            if (enrollErr) return callback({ status: 500, message: 'Erro Matrícula' });
            const enrollmentId = this.lastID;
            db.run('INSERT INTO payments (enrollment_id, amount, status) VALUES (?, ?, ?)', [enrollmentId, course.price, status], (paymentErr) => {
              if (paymentErr) return callback({ status: 500, message: 'Erro Pagamento' });
              db.run('INSERT INTO audit_logs (action, created_at) VALUES (?, datetime("now"))', [`Checkout curso ${courseId} por ${userId}`], () => callback(null, { msg: 'Sucesso', enrollment_id: enrollmentId }));
            });
          });
        };
        if (user) return finish(user.id);
        this.db.run('INSERT INTO users (name, email, pass) VALUES (?, ?, ?)', [name, email, password || '123456'], function (createErr) {
          if (createErr) return callback({ status: 500, message: 'Erro ao criar usuário' });
          finish(this.lastID);
        }.bind(this));
      });
    });
  }
}
module.exports = CheckoutService;
