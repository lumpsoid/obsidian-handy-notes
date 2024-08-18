{
  description = "Dev obsidian extension";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
  };

  outputs = { self, nixpkgs }: 
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs {
		system = "x86_64-linux";
		config.allowUnfree = true;
	};
  in 
  {

    devShells.${system}.default = pkgs.mkShell {
      name = "obsidian-zettelflow";
      buildInputs = with pkgs; [
		nodejs_22
		obsidian
      ];
      shellHook = ''
		tmux -L "obsidian-zettelflow"
      '';
    };

  };
}

