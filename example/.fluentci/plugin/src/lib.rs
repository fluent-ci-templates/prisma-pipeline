use extism_pdk::*;
use fluentci_pdk::dag;

#[plugin_fn]
pub fn setup(version: String) -> FnResult<String> {
    let version = if version.is_empty() {
        "latest".to_string()
    } else {
        version
    };

    let stdout = dag()
        .pkgx()?
        .with_exec(vec!["type node > /dev/null || pkgx install node"])?
        .with_exec(vec!["pkgx", "install", "bun"])?
        .with_exec(vec!["bun", "install", "-g", &format!("prisma@{}", version)])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn validate(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_exec(vec![
            "pkgx",
            "+nodejs.org",
            "+bun",
            "bunx",
            "prisma",
            "validate",
            args.as_str(),
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn push(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_exec(vec!["pkgx", "+nodejs.org", "+bun", "bun", "install"])?
        .with_exec(vec![
            "pkgx",
            "+nodejs.org",
            "+bun",
            "bunx",
            "prisma",
            "db",
            "push",
            args.as_str(),
        ])?
        .stdout()?;
    Ok(stdout)
}

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    let stdout = dag()
        .pkgx()?
        .with_exec(vec!["pkgx", "+nodejs.org", "+bun", "bun", "install"])?
        .with_exec(vec![
            "pkgx",
            "+nodejs.org",
            "+bun",
            "bunx",
            "prisma",
            "migrate",
            "deploy",
            args.as_str(),
        ])?
        .stdout()?;
    Ok(stdout)
}
