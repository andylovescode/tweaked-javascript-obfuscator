import { Utils } from '../../../utils/Utils';

export const IdentifierNamesGenerator: Readonly<{
    DictionaryIdentifierNamesGenerator: 'dictionary';
    HexadecimalIdentifierNamesGenerator: 'hexadecimal';
    MangledIdentifierNamesGenerator: 'mangled';
    MangledShuffledIdentifierNamesGenerator: 'mangled-shuffled';
	IncrementalIdentifierNamesGenerator: 'incremental';
}> = Utils.makeEnum({
    DictionaryIdentifierNamesGenerator: 'dictionary',
    HexadecimalIdentifierNamesGenerator: 'hexadecimal',
    MangledIdentifierNamesGenerator: 'mangled',
    MangledShuffledIdentifierNamesGenerator: 'mangled-shuffled',
	IncrementalIdentifierNamesGenerator: 'incremental'
});
