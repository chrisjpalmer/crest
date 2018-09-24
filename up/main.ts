import { Command, flags } from '@oclif/command'
import { Route, Name } from './util/util';
import { buildController } from './controller';
import { buildEntity } from './entity';
import { buildModel } from './model';

class Up extends Command {
  static flags = {
    route: flags.string({
      required: false,
      description: 'applies only to controller create mode... for authenticated routes "@/my/api" OR "authenticated/my/api"... for unauthenticated use "my/api"'
    }),
  }

  static args = [
    { name: 'mode', options: ['create'] },
    { name: 'type', options: ['entity', 'model', 'controller'] },
    { name: 'name', description: 'the name of the type of code block you are going to create' }
  ]

  nameParse(name: any) {
    if (!name) {
      throw 'you must supply the name argument to this command'
    }

    if (name[0].toUpperCase() !== name[0]) {
      throw 'when specifying a name, it should be specified in pascal case: ie. "Book", "BookCategory"';
    }

    if (name.indexOf('.') !== -1) {
      throw 'the name argument cannot contain \'.\' characters';
    }
  }

  async run() {
    const { flags, args } = this.parse(Up);


    //Check for the destination
    this.nameParse(args.name);
    let name: Name = new Name(args.name);

    switch (args.type) {
      case 'controller':
        if (!flags.route) {
          throw 'when specifying the controller option, you must supply the --route flag'
        }
        let route = new Route(flags.route);
        await buildController(name, route);

        break;

      case 'entity':
        await buildEntity(name);
        break;
      case 'model':
        await buildModel(name);
        break;
      default:
        break;
    }
  }
}

Up.run(null, null)
  .catch((e) => {
    console.log('\n\n\nERR: ', e)
  });