const sequelize = require('./db');
const { User, Board, List, Card } = require('./models/index');

async function seed() {
  try {
    // 1. Sincronizar modelos con la base de datos
    // { force: true } borra las tablas existentes y las crea de nuevo. 
    // Ideal para desarrollo cuando cambias la estructura.
    console.log('Sincronizando la base de datos...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente.');

    // 2. Crear Usuarios de prueba
    const user1 = await User.create({
      username: 'leo_dev',
      email: 'leo@bootcamp.com'
    });

    const user2 = require('./models/User').create({
      username: 'david_pm',
      email: 'david@kanbanpro.com'
    });

    // 3. Crear un Tablero para el primer usuario
    const board1 = await Board.create({
      title: 'Proyecto KanbanPro - Sprint 2',
      UserId: user1.id // Relacionamos con el ID de Leo
    });

    // 4. Crear Listas para ese Tablero
    const listTodo = await List.create({
      title: 'To Do',
      order: 1,
      BoardId: board1.id
    });

    const listDone = await List.create({
      title: 'Done',
      order: 2,
      BoardId: board1.id
    });

    // 5. Crear Tarjetas (Tareas)
    await Card.create({
      title: 'Instalar Sequelize',
      description: 'Configurar el ORM y la conexión a Postgres',
      priority: 'high',
      ListId: listTodo.id
    });

    await Card.create({
      title: 'Definir Modelos',
      description: 'Crear archivos para User, Board, List y Card',
      priority: 'medium',
      ListId: listDone.id
    });

    console.log('✅ ¡Base de datos poblada con éxito!');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    // Cerramos la conexión para que el script termine de ejecutarse
    await sequelize.close();
  }
}

seed();