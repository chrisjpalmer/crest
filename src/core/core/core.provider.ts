/** BOILERPLATE - don't touch unless you are brave */

/** NestProvider
 * Is a typescript safeguard over the Nest JS custom provider mechanism.
 * There are two ways to create components/providers in nest:
 * 1) Using the Component decorator
 * 2) Using the Custom Component definition (class below)
 *
 * The Component decorator is a managed solution by Nest and is the simplest way to do dependancy injection.
 * Just applly the decorator your desired class and included it in the Nest Module component array
 *
 * In the case that you need to make a component out of something which is agnostic to Nest
 * you can use the Custom Component definition. In this case pass NestProvider object to the Nest Module component array
 *
 * To see the origins of this methodology see: https://docs.nestjs.com/fundamentals/dependency-injection
 *
 */
export class NestProvider {
  /** The key that will be used with Inject decorator to retrieve this Component.
   * 'provide' is necessary for custom components because Nest can't detect the class type.
   * Since we are providing a string key for identifiying the component,
   * Nest keeps injection consistent and requires you to specify the
   * Inject(provide) deocrator for custom components */
  provide: string;

  /**
   * A function which returns the component to be used for injection.
   * The function can accept arguments of other components it may depend on for initialization.
   * For each of these components, you must add an entry to inject array.
   * This entry will be either the provide key of the desired custom component OR a string version of its class name (if defined using the Component() decorator)
   */
  useFactory: (...injectableArgs: any[]) => any;

  /**
   * An array of provide tokens of the components which should be injected into the useFactory function.
   * The order of these tokens must correspond to the order in which the components are specified in the useFactory method.
   * The provide key will be the same used for the 'provide' property of that custom component.
   * Alternatively if the desired component was created using Component decorator, specify the exact class name
   */
  inject?: string[];
}
