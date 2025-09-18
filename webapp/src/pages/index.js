// my-docs/src/pages/index.js
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import Heading from "@theme/Heading";
import { Users, UserCheck, UserPlus, Group } from "lucide-react";
import styles from "./index.module.css";
import { checkUserInGroup } from "../utils/validateUser";
import { formatDate } from "../utils/formatDate";
import RulesButton from "../components/RulesButton";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <img
            src="/img/watchtra-logo.svg"
            alt="WatchTra Logo"
            style={{
              width: "100px",
              marginRight: "15px",
              verticalAlign: "middle",
            }}
          />
          <br></br>
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
  const [lastUpdated, setLastUpdated] = useState("");
  const { siteConfig } = useDocusaurusContext();
  const { storageAccountName, storageContainerName, storageSasToken } = siteConfig.customFields;

  useEffect(() => {
    const useAzureStorage =
      storageAccountName && storageContainerName && storageSasToken;
    const baseUrl = useAzureStorage
      ? `https://${storageAccountName}.blob.core.windows.net/${storageContainerName}?${storageSasToken}`
      : "";

    Promise.all([
      fetch(`${baseUrl}/users-results.json`).then((r) => r.json()),
      fetch(`${baseUrl}/groups-results.json`).then((r) => r.json()),
      fetch(`${baseUrl}/logs-results.json`).then((r) => r.json()),
    ])
      .then(([userData, groupData, logData]) => {
        setUsers(userData.findings);
        setGroups(groupData.groups);
        setLogs(logData.logs);
        setLastUpdated(userData.lastUpdated);
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
        <div class="row">
          <div class="col col--6">
            <div class="col-demo">
              <h2 class={styles.h2titles}>Statistics</h2>
            </div>
          </div>
          <div class="col col--6">
            <div class="col-demo">
              <h2 class={styles.lastSyncDate}>
                Last Sync Date: {lastUpdated ? formatDate(lastUpdated) : "…"}
              </h2>
            </div>
          </div>
        </div>
        <div class={clsx("row", styles.statistics)}>
          <div class={clsx("col col--2", styles.stacol)}>
            <div className={clsx(styles.colDemo)}>
              <Users size={28} color="#4F46E5" />
              <strong>{users.length}</strong>
              <p>Total Users</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div className={clsx(styles.colDemo)}>
              <UserCheck size={28} color="#4F46E5" />
              <strong>
                {users.filter((user) => user.userType === "Member").length}
              </strong>
              <p>Members</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div className={clsx(styles.colDemo)}>
              <UserPlus size={28} color="#4F46E5" />
              <strong>
                {users.filter((user) => user.userType === "Guest").length}
              </strong>
              <p>Guests</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div className={clsx(styles.colDemo)}>
              <Group size={28} color="#4F46E5" />
              <strong>{groups.length}</strong>
              <p>Dynamic Groups</p>
            </div>
          </div>
          <div class={clsx("col col--2", styles.stacol)}>
            <div className={clsx(styles.colDemo)}>
              <UserPlus size={28} color="#4F46E5" />
              <strong>????</strong>
              <p>???</p>
            </div>
          </div>
        </div>
        <h2 class={styles.h2titles}>User Issues</h2>
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
                    className={clsx(
                      expandedUser !== user.userPrincipalName &&
                        "cursor-pointer"
                    )}
                    onClick={() => toggleRow(user.userPrincipalName)}
                  >
                    <td>{user.userType}</td>
                    <td>{user.userPrincipalName}</td>
                    <td>{user.name}</td>
                    <td className="text--center">
                      <span
                        className={clsx(
                          "badge",
                          Object.keys(user.issues).length === 0
                            ? "badge--success"
                            : Object.keys(user.issues).length < 3
                            ? "badge--warning"
                            : "badge--danger",
                          styles.issueBadge // custom class for sizing
                        )}
                      >
                        {Object.keys(user.issues).length}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr
                      className="expanded-row"
                      style={{ backgroundColor: "white" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <td colSpan={4}>
                        <Tabs>
                          <TabItem value="usersummary" label="User Summary">
                            <div className="mb-4">
                              <h4 className="font-bold mb-2">User Summary</h4>
                            </div>

                            <div className={`card ${styles.userCard}`}>
                              {/* Top section: avatar + name */}
                              <div
                                className={`card__header ${styles.userCardHeader}`}
                              >
                                <div className={styles.userAvatar}>
                                  <img
                                    className="avatar__photo"
                                    src="https://avatars1.githubusercontent.com/u/4060187?s=460&v=4"
                                    alt={user.name}
                                  />
                                  <div className="avatar__intro">
                                    <div className={styles.userName}>
                                      {user.name}
                                    </div>
                                    <small className={styles.userJob}>
                                      {user.jobTitle}
                                    </small>
                                  </div>
                                </div>
                              </div>

                              {/* Body: two columns with separator */}
                              <div
                                className={`card__body ${styles.userCardBody}`}
                              >
                                <div className={styles.userInfoColumn}>
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
                                </div>

                                <div className={styles.userInfoSeparator}></div>

                                <div className={styles.userInfoColumn}>
                                  <p>
                                    <strong>CompanyName:</strong>{" "}
                                    {user.companyName}
                                  </p>
                                  <p>
                                    <strong>Country:</strong> {user.country}
                                  </p>
                                  <p>
                                    <strong>Department:</strong>{" "}
                                    {user.department}
                                  </p>
                                  <p>
                                    <strong>Manager:</strong> {user.manager}
                                  </p>
                                </div>
                              </div>

                              {/* Footer button */}
                              <div className="card__footer">
                                <a
                                  href={`https://portal.azure.com/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/overview/userId/${user.id}/hidePreviewBanner~/true`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="button button--secondary button--block"
                                >
                                  See in Entra ID
                                </a>
                              </div>
                            </div>
                          </TabItem>
                          <TabItem value="issues" label="Issues" default>
                            <div>
                              <h4>Issues</h4>
                              {Object.keys(user.issues).length >= 3 ? (
                                <div
                                  className="alert alert--danger"
                                  role="alert"
                                  style={{
                                    marginTop: "1rem",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  <button
                                    aria-label="Close"
                                    className="clean-btn close"
                                    type="button"
                                  >
                                    <span aria-hidden="true">&times;</span>
                                  </button>
                                  <strong>Alert:</strong> There are{" "}
                                  {Object.keys(user.issues).length} issues!
                                  Please investigate.
                                </div>
                              ) : Object.keys(user.issues).length > 0 ? (
                                <div
                                  className="alert alert--warning"
                                  role="alert"
                                  style={{
                                    marginTop: "1rem",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  <button
                                    aria-label="Close"
                                    className="clean-btn close"
                                    type="button"
                                  >
                                    <span aria-hidden="true">&times;</span>
                                  </button>
                                  <strong>Warning:</strong> Only{" "}
                                  {Object.keys(user.issues).length} issue(s).
                                  Pay attention.
                                </div>
                              ) : null}
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
                              <div
                                class="alert alert--warning"
                                role="alert"
                                style={{
                                  marginTop: "1rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                <button
                                  aria-label="Close"
                                  class="clean-btn close"
                                  type="button"
                                >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                                <strong>Warning: </strong>
                                This is a alert. Be warned, you should pay
                                attention!
                              </div>
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
                                          <tr key={g.name}>
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
                              <div
                                class="alert alert--info"
                                role="alert"
                                style={{
                                  marginTop: "1rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                <button
                                  aria-label="Close"
                                  class="clean-btn close"
                                  type="button"
                                >
                                  <span aria-hidden="true">&times;</span>
                                </button>
                                <strong>Info: </strong>
                                This is an alert. For your information only.
                              </div>
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
                                        <tr key={l.id}>
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
