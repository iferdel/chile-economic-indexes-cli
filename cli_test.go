package main

import (
	"testing"
)

func TestCleanInput(t *testing.T) {
	cases := []struct {
		input string
		want  []string
	}{
		{input: "hello test", want: []string{"hello", "test"}},
		{input: "test ", want: []string{"test"}},
		{input: " test", want: []string{"test"}},
	}

	for _, tc := range cases {
		got := cleanInput(tc.input)
		want := tc.want
		if len(got) != len(want) {
			t.Errorf("got %q, want %v", got, want)
		}
		for i := 0; i < len(got); i++ {
			if got[i] != want[i] {
				t.Errorf("got word %q, but expected %q", got[i], want[i])
			}
		}
	}

}
