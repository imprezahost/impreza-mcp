// tools/list must be local. Refuse every network attempt in this fixture.
globalThis.fetch=async()=>{throw new Error('fixture refuses network access');};
