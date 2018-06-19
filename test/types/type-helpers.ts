// This will fail ;)
// $ExpectType string
type Test_01_number_is_not_string = number;

import { Arg1, Arg2, Equals } from '../../src/type-helpers';

// $ExpectType string
type Arg1_extracts_arg1_from_unary_function = Arg1<(x: string) => void>;

// $ExpectType string
type Arg1_extracts_arg1_from_binary_function = Arg1<(x: string, y: number) => void>;

// $ExpectType never
type Arg1_extracts_never_from_nullary_function = Arg1<() => void>;

// $ExpectType string
type Arg2_extracts_arg2_from_binary_function = Arg2<(x: number, y: string) => void>;

// $ExpectType string
type Arg2_extracts_arg2_from_trinary_function = Arg2<(x: number, y: string, z: number) => void>;

// $ExpectType never
type Arg2_extracts_never_from_unary_function = Arg2<(x: number) => void>;

// $ExpectType never
type Arg2_extracts_never_from_nullary_function = Arg2<() => void>;

// $ExpectType true
type Equals_string_string_is_true = Equals<string, string>;

// $ExpectType false
type Equals_string_number_is_false = Equals<string, number>;