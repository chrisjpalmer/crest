/** BOILERPLATE - don't touch unless you are brave */
export type RepoAllType = string;
export const RepoAll: RepoAllType = 'All';

/**
 * IndexSet indexes the result set passed by the indexFunction and returns a Map<SetKeyType SetType>.
 * It is used in conjunction with StichSet. IndexSet relies on a function called indexFunc
 * which takes the SetType as a parameter and returns the key by which the set should be indexed.
 * @param set set you want to index
 * @param indexFunc function that returns the key by which the set will be indexed.
 */
export function IndexSet<SetType, SetKeyType>(
  set: SetType[],
  indexFunc: (t: SetType) => SetKeyType,
): Map<SetKeyType, SetType> {
  let output = new Map<SetKeyType, SetType>();
  set.forEach(t => {
    output.set(indexFunc(t), t);
  });
  return output;
}

/**
 * StitchSet function allows two datasets to be stitched together. Imagine you want to retreive all users
 * and you want the role subobject of each user object to be populated too. There are two ways to do this:
 * 1) Perform an inner join between the roles and the users table - let typeORM take care of the rest
 * 2) Make a query on the roles table, make a seperate query on the users table
 * The first option will always work however, think about how much uneceesary data would be sent back from the database.
 * You get all the users x roles worth of data back.
 *
 * The second option is more efficient. But how can we stitch the two results sets together, to maintain
 * object heirarchy? StitchSet solves this problem. Pass StitchSet the parent set and the subset. Then
 * provide two helper functions for (a) retrieving a list of ids to pull from the subset AND (b) installing the subset items in the parent set.
 * The result is that the parent set passed will be populated with the subset. This is much more efficient than making a large INNER JOIN
 *
 * You may be wondering how this function knows which subset items relate to which ids. StitchSet relies
 * on indexed data (See IndexSet). You must provide a set as a Map<number, SETTYPE> where the key is the numerical id of the row in the database
 *
 * @param set parent set to be affected e.g. users - StitchSet will make changes directly to this object
 * @param subset subset containing sub data to populate parent set e.g. roles
 * @param stitchPull function which returns an array of ids to pull from the subset
 * @param stitchPush function which installs the subset data in the parent
 */
export function StitchSet<ParentSetType, SubSetType>(
  set: ParentSetType | ParentSetType[] | Map<any, ParentSetType>,
  subset: Map<number, SubSetType>,
  stitchPull: (setItem: ParentSetType) => number[],
  stitchPush: (setItem: ParentSetType, subsetToPush: SubSetType[]) => void,
) {
  let input: ParentSetType[] = [];
  if (typeof set === 'object') {
    if (set instanceof Map) {
      (<Map<number, ParentSetType>>set).forEach(v => input.push(v));
    } else if (Array.isArray(set)) {
      input = <ParentSetType[]>set;
    } else {
      input.push(<ParentSetType>set);
    }
  } else {
    return;
  }

  //For each thing in the main set, lets fill it up with something in the subset
  input.forEach(s => {
    //First lets get the subset item ids which need to go inside.
    //This is known as PULL phase of the stitch operation,we pull the subset ids out
    let subsetIDs = stitchPull(s);

    //Now we get all the items in the subset which are of those ids
    let subsetItems = [];
    subsetIDs.forEach(ss => subsetItems.push(subset.get(ss)));

    //Now we push those back into the set object.
    //This is known as the PUSH phase.
    stitchPush(s, subsetItems); //This function must handle the insertion of the subset into the set.

    //Remember, everything in javascript is references so the operation will definately affect the source
  });
}

//TODO: Delete this function
/**
 * ExtractSubIDs is a helper function that allows you to retrieve all the ids of a subset of your main query
 * into an array which will contain the unique list of ids. The classic example is your main query retrieves users and inner joins on their role ids
 * Now you need to make a second query on all the roles which those user's are linked to. Running this function over the users array will allow you to retrieve
 * the role ids you need to then make a query on the roles table. It is more effecient to do this than to perform a large inner join - due to the size of the result set.
 * @param topSet
 * @param extractFunction
 */
export function ExtractSubIDs<T>(
  topSet: T[],
  extractFunction: (t: T) => number[] | boolean,
): number[] {
  let uniqueSubIDs = new Map<number, boolean>();
  topSet.forEach(t => {
    let ids = extractFunction(t);
    if (ids === true || ids === false) {
    } else {
      ids.forEach(id => uniqueSubIDs.set(id, true));
    }
  });
  let subIDs = [];
  uniqueSubIDs.forEach(id => subIDs.push(id));
  return subIDs;
}
