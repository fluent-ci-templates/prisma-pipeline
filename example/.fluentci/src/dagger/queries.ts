import { gql } from "../../deps.ts";

export const validate = gql`
  query Validate($src: String!, $databaseUrl: String!) {
    validate(src: $src, databaseUrl: $databaseUrl)
  }
`;

export const deploy = gql`
  query Deploy($src: String!, $databaseUrl: String!) {
    deploy(src: $src, databaseUrl: $databaseUrl)
  }
`;

export const push = gql`
  query Push($src: String!, $databaseUrl: String!) {
    push(src: $src, databaseUrl: $databaseUrl)
  }
`;
