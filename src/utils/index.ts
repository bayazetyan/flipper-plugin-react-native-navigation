export const updateObjAttribute = (path: string[], entity: Record<string, any>, value: any) => {
  const deepClone = JSON.parse(JSON.stringify(entity));
  let obj = deepClone;

  path.forEach((part, index) => {
    if (obj[part] !== undefined) {
      if (index < path.length - 1) {
        obj = obj[part];
      } else {
        obj[part] = value;
      }
    }
  });

  return deepClone
};

