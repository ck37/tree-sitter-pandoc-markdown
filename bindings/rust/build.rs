fn main() {
    let block_dir = std::path::Path::new("tree-sitter-pandoc-markdown").join("src");
    let inline_dir = std::path::Path::new("tree-sitter-pandoc-markdown-inline").join("src");

    let mut c_config = cc::Build::new();
    c_config.std("c11").include(&block_dir);

    // Suppress false-positive unused warnings from scanner.c
    // These functions/variables are actually used at runtime but the compiler's
    // static analysis doesn't trace through the full call graph
    c_config.flag_if_supported("-Wno-unused-function");
    c_config.flag_if_supported("-Wno-unused-const-variable");

    #[cfg(target_env = "msvc")]
    c_config.flag("-utf-8");

    for path in &[
        block_dir.join("parser.c"),
        block_dir.join("scanner.c"),
        inline_dir.join("parser.c"),
        inline_dir.join("scanner.c"),
    ] {
        c_config.file(path);
        println!("cargo:rerun-if-changed={}", path.to_str().unwrap());
    }

    c_config.compile("tree-sitter-pandoc-markdown");
}
