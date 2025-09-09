// my-docs/src/pages/index.js
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import styles from "./index.module.css";
import { checkUserInGroup } from "../utils/validateUser";
import RulesButton from "../components/RulesButton";


function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/users-results.json").then((r) => r.json()),
      fetch("/groups-results.json").then((r) => r.json()),
      fetch("/logs-results.json").then((r) => r.json()),
    ])
      .then(([userData, groupData, logData]) => {
        setUsers(userData.findings);
        setGroups(groupData.groups);
        setLogs(logData.logs);
      })
      .catch(console.error);
  }, []);

  const toggleRow = (userPrincipalName) => {
    setExpandedUser(
      expandedUser === userPrincipalName ? null : userPrincipalName
    );
  };

  return (
    <Layout
      title="User Audit Dashboard"
      description="User issues, dynamic groups, and audit logs"
    >
      <HomepageHeader />
      <main className="container mx-auto p-6">
        <div class={clsx("row", styles.statistics)}>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">
              <strong>{users.length}</strong>
              <p>Total Users</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">
              <strong>
                {users.filter((user) => user.userType === "Member").length}
              </strong>
              <p>Members</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">
              <strong>
                {users.filter((user) => user.userType === "Guest").length}
              </strong>
              <p>Guests</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">2</div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">2</div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div class="col-demo">2</div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">User Issues</h2>
        <table
          className={clsx(
            "min-w-full border border-gray-300",
            styles.userissuetable
          )}
        >
          <thead className="bg-gray-100">
            <tr>
              <th>UserType</th>
              <th>UserPrincipalName</th>
              <th>Name</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isExpanded = expandedUser === user.userPrincipalName;

              // Filter audit logs for this user
              const userLogs = logs.filter(
                (l) =>
                  l.initiatedBy === user.userPrincipalName ||
                  l.target.includes(user.userPrincipalName)
              );

              return (
                <React.Fragment key={user.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleRow(user.userPrincipalName)}
                  >
                    <td>{user.userType}</td>
                    <td>{user.userPrincipalName}</td>
                    <td>{user.name}</td>
                    <td>{Object.keys(user.issues).length}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={3} className="border px-4 py-2 bg-gray-50">
                        <Tabs>
                          <TabItem value="usersummary" label="User Summary">
                            <div className="mb-4">
                              <h4 className="font-bold mb-2">User Summary</h4>
                            </div>
                            <div className="card p-4 bg-purple-100 shadow rounded">
                              <div class="avatar mb-4 flex flex-col items-center">
                                <img
                                  class="avatar__photo"
                                  src="https://avatars1.githubusercontent.com/u/4060187?s=460&v=4"
                                />
                                <div class="avatar__intro">
                                  <div class="avatar__name">{user.name}</div>
                                  <small class="avatar__subtitle ">
                                    {user.jobTitle}
                                  </small>
                                </div>
                              </div>
                              <div class="card__body">
                                <p>
                                  <strong>ID:</strong> {user.id}
                                </p>
                                <p>
                                  <strong>Account Enabled:</strong>{" "}
                                  {user.accountEnabled ? "Yes" : "No"}
                                </p>
                                <p>
                                  <strong>UserType:</strong> {user.userType}
                                </p>
                                <p>
                                  <strong>User Principal Name:</strong>{" "}
                                  {user.userPrincipalName}
                                </p>
                                <p>
                                  <strong>CompanyName:</strong>{" "}
                                  {user.companyName}
                                </p>
                                <p>
                                  <strong>Country:</strong> {user.country}
                                </p>
                                <p>
                                  <strong>Department:</strong> {user.department}
                                </p>
                                <p>
                                  <strong>Manager:</strong> {user.manager}
                                </p>
                              </div>
                              <div class="card__footer">
                                <button class="button button--secondary button--block">
                                  See in Entra ID
                                </button>
                              </div>
                            </div>
                          </TabItem>
                          <TabItem value="issues" label="Issues" default>
                            <div>
                              <h4>Issues</h4>
                              <div>
                                <table className={styles.tabtables}>
                                  <thead>
                                    <tr>
                                      <th>Attribute</th>
                                      <th>Value</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(user.issues).map(
                                      ([key, value]) => (
                                        <tr key={key}>
                                          <td>{key}</td>
                                          <td
                                            className={`border px-4 py-2 font-bold ${
                                              value === null
                                                ? "text-red-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            {value === null ? "null" : value}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                                <div class="card__footer">
                                  <RulesButton />
                                </div>
                              </div>
                            </div>
                          </TabItem>
                          <TabItem
                            value="groups"
                            label="Dynamic Groups"
                            default
                          >
                            <div>
                              <h4>Dynamic Group Membership</h4>
                              <div>
                                <table className={styles.tabtables}>
                                  <thead>
                                    <tr>
                                      <th>Status</th>
                                      <th>Group</th>
                                      <th>Member Count</th>
                                      <th>Membership Rule</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {groups.length > 0 ? (
                                      groups
                                        // step 1: add status
                                        .map((g) => ({
                                          ...g,
                                          status: checkUserInGroup(
                                            user,
                                            g.membershipRule
                                          ),
                                        }))
                                        // step 2: sort by status
                                        .sort((a, b) => {
                                          const order = {
                                            "In Group": 0,
                                            "Not in Group": 1,
                                            Unknown: 2,
                                          };
                                          return (
                                            order[a.status] - order[b.status]
                                          );
                                        })
                                        // step 3: render with color
                                        .map((g) => (
                                          <tr
                                            key={g.name}
                                            className="hover:bg-gray-50"
                                          >
                                            <td>
                                              <span
                                                className={clsx(
                                                  "badge",
                                                  g.status === "In Group"
                                                    ? "badge--success"
                                                    : g.status ===
                                                      "Not in Group"
                                                    ? "badge--danger"
                                                    : "badge--warning"
                                                )}
                                              >
                                                {g.status}
                                              </span>
                                            </td>
                                            <td>{g.name}</td>
                                            <td>{g.memberCount}</td>
                                            <td>{g.membershipRule}</td>
                                          </tr>
                                        ))
                                    ) : (
                                      <tr>
                                        <td colSpan={4}>No groups available</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabItem>

                          <TabItem value="logs" label="Audit Logs">
                            <div>
                              <h4>Audit Logs</h4>
                              <div>
                                <table className={styles.tabtables}>
                                  <thead>
                                    <tr>
                                      <th>Activity</th>
                                      <th>Initiator</th>
                                      <th>Target</th>
                                      <th>Modified Properties</th>
                                      <th>Timestamp</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userLogs.length > 0 ? (
                                      userLogs.map((l) => (
                                        <tr
                                          key={l.id}
                                          className="hover:bg-gray-50 align-top"
                                        >
                                          <td>{l.activity}</td>
                                          <td>{l.initiatedBy}</td>
                                          <td>{l.target}</td>
                                          <td>
                                            {l.modifiedProperties &&
                                            l.modifiedProperties.length > 0 ? (
                                              <ul className="list-disc pl-5">
                                                {l.modifiedProperties.map(
                                                  (p, idx) => (
                                                    <li key={idx}>
                                                      <strong>
                                                        {p.displayName}
                                                      </strong>
                                                      : {p.oldValue ?? "null"} →{" "}
                                                      {p.newValue ?? "null"}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            ) : (
                                              "—"
                                            )}
                                          </td>
                                          <td>
                                            {new Date(
                                              l.timestamp
                                            ).toLocaleString()}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={5}>No logs found</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </TabItem>
                        </Tabs>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </main>
    </Layout>
  );
}
